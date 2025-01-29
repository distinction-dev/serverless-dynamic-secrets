const fs = require('fs');
const parseArgs = require('yargs-parser');
const OPTION_PARAMETER_FILE = 'parameter-file';
const OPTION_PARAMETER_OVERRIDES = 'parameter-overrides';

module.exports = class CfParametersPlugin {
    constructor(serverless, options) {
        console.log("Dynamic CF Parameters and Secrets Plugin Initialized");
        this.serverless = serverless;
        this.options = options;

        this.commands = {
            deploy: {
                options: {
                    [OPTION_PARAMETER_FILE]: {
                        usage: 'Provide a JSON file to define secrets and parameters',
                        required: true,
                        type: 'string'
                    },
                    [OPTION_PARAMETER_OVERRIDES]: {
                        usage: 'Override parameters dynamically',
                        required: false,
                        type: 'multiple'
                    }
                }
            },
            package: {
                options: {
                    [OPTION_PARAMETER_FILE]: {
                        usage: 'Provide a JSON file for parameter overrides',
                        required: false,
                        type: 'string'
                    }
                }
            }
        };
        this.hooks = {
            'before:package:finalize': this.addSecretsAndParameters.bind(this),
            'before:aws:deploy:deploy:updateStack': this.injectParameterOverrides.bind(this)
        };
        this.providerRequest = this.getProvider().request.bind(this.provider);
       
    }

    addSecretsAndParameters() {
        const parameterFile = this.options[OPTION_PARAMETER_FILE];
        if (!parameterFile) {
            throw new Error("The --parameter-file option is required to define secrets and parameters.");
        }

        const secretsData = JSON.parse(fs.readFileSync(parameterFile, 'utf-8'));
        const cloudFormationTemplate = this.serverless.service.provider.compiledCloudFormationTemplate;

        // console.log("Loaded Secrets Data:", JSON.stringify(secretsData, null, 2));

        // Add Parameters 
        // Note: Here need to enhancement to check if same name of other resource or paramteres exist in stack or not
        cloudFormationTemplate.Parameters = {
            ...(cloudFormationTemplate.Parameters || {}),
            ...this.generateParameters(secretsData)
        };

        // console.log("Generated Parameters:", JSON.stringify(cloudFormationTemplate.Parameters, null, 2));

        // Add Secrets Manager Resources
        // Note: Here need to enhancement to check if same name of other resource or secret manager exist in stack or not
        cloudFormationTemplate.Resources = {
            ...(cloudFormationTemplate.Resources || {}),
            ...this.generateSecrets(secretsData)
        };

        // console.log("Generated Secrets Manager Resources:", JSON.stringify(cloudFormationTemplate.Resources, null, 2));
    }

    generateParameters(secretsData) {
        const parameters = {};

        for (const [key] of Object.entries(secretsData)) {
            parameters[key] = {
                Type: 'String',
                NoEcho: true
            };
        }

        return parameters;
    }

    generateSecrets(secretsData) {
        const resources = {};

        for (const [key] of Object.entries(secretsData)) {
            resources[`SecretFor${key}`] = {
                Type: 'AWS::SecretsManager::Secret',
                Properties: {
                    Name: key,
                    Description: `Secret dynamically created for ${key}`,
                    SecretString: {
                        Ref: key
                    }
                }
            };
        }

        return resources;
    }
    getProvider() {
        if (!this.provider) {
            this.provider = this.serverless.getProvider('aws');
            if (!this.provider) {
                throw new Error("AWS provider not found. Ensure this plugin is used with the AWS provider.");
            }
        }
        return this.provider;
    }
    injectParameterOverrides() {
    
        this.provider.request = async (...args) => {
            let [service, method, params] = args;
    
    
            const compiledParametersTemplate =
                this.serverless.service.provider.compiledCloudFormationTemplate.Parameters || {};
            // console.log("compiledParametersTemplate:", compiledParametersTemplate);
    
            if (service === 'CloudFormation' && (method === 'updateStack' || method === 'createChangeSet')) {
                // Fetch current parameters from the deployed template
                const response = await this.providerRequest('CloudFormation', 'getTemplate', {
                    StackName: params.StackName
                });
                const currentParameters = JSON.parse(response.TemplateBody).Parameters || {};
                // console.log("currentParameters:", JSON.stringify(currentParameters));
    
                // Build the list of parameters
                const overrides = this.getOverrides();
                // console.log("overrides:", JSON.stringify(overrides));
    
                params.Parameters = Object.keys(compiledParametersTemplate)
                    .map((paramKey) => {
                        if (overrides[paramKey] !== undefined) {
                            return {
                                ParameterKey: paramKey,
                                ParameterValue: overrides[paramKey]
                            };
                        } else if (currentParameters[paramKey]) {
                            return {
                                ParameterKey: paramKey,
                                UsePreviousValue: true
                            };
                        }
                    })
                    .filter(Boolean);
    
                // console.log("Final Parameters:", JSON.stringify(params.Parameters));
            }
    
            return this.providerRequest(...args);
        };
    }
    
    
    

    getOverrides() {
        let parameterOverrides = this.options[OPTION_PARAMETER_OVERRIDES] || [];
        if (!Array.isArray(parameterOverrides)) {
            parameterOverrides = [parameterOverrides];
        }

        const cliOverrides = parseArgs(
            parameterOverrides.map((param) => `--${param}`).join(' '),
            { configuration: { 'parse-numbers': false } }
        );
        // console.log("Parameter Overrides from CLI:", JSON.stringify(cliOverrides));

        const fileOverrides = this.options[OPTION_PARAMETER_FILE]
            ? JSON.parse(fs.readFileSync(this.options[OPTION_PARAMETER_FILE], 'utf-8'))
            : {};

        // console.log("Parameter Overrides from File:", JSON.stringify(fileOverrides));

        return { ...fileOverrides, ...cliOverrides };
    }
};