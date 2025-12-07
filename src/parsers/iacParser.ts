export interface IacComponent {
    name: string;
    type: string;
    domainType: string;
    technology: string;
    variable: string;
}

export interface IacConnection {
    source: string;
    destination: string;
    label: string;
    technology: string;
}

export interface IacFactory {
    name: string;
    components: IacComponent[];
    connections: IacConnection[];
}

export class IacParser {
    /**
     * Parse Python code to extract IAC Factory components and connections
     */
    static parse(code: string): IacFactory | null {
        const factory: IacFactory = {
            name: 'Infrastructure',
            components: [],
            connections: []
        };

        // Extract factory name
        const factoryMatch = code.match(/IacFactory\s*\(\s*name\s*=\s*["']([^"']+)["']/);
        if (factoryMatch) {
            factory.name = factoryMatch[1];
        }

        // Extract components
        const componentPatterns = [
            { type: 'Gateway', regex: /(\w+)\s*=\s*Gateway\s*\(\s*["']([^"']+)["']\s*,\s*domain_type\s*=\s*["']([^"']+)["']\s*,\s*technology\s*=\s*["']([^"']+)["']/g },
            { type: 'Container', regex: /(\w+)\s*=\s*Container\s*\(\s*["']([^"']+)["']\s*,\s*domain_type\s*=\s*["']([^"']+)["']\s*,\s*technology\s*=\s*["']([^"']+)["']/g },
            { type: 'Lambda', regex: /(\w+)\s*=\s*Lambda\s*\(\s*["']([^"']+)["']\s*,\s*domain_type\s*=\s*["']([^"']+)["']\s*,\s*technology\s*=\s*["']([^"']+)["']/g },
            { type: 'Cache', regex: /(\w+)\s*=\s*Cache\s*\(\s*["']([^"']+)["']\s*,\s*domain_type\s*=\s*["']([^"']+)["']\s*,\s*technology\s*=\s*["']([^"']+)["']/g },
            { type: 'Rdms', regex: /(\w+)\s*=\s*Rdms\s*\(\s*["']([^"']+)["']\s*,\s*domain_type\s*=\s*["']([^"']+)["']\s*,\s*technology\s*=\s*["']([^"']+)["']/g },
            { type: 'Archive', regex: /(\w+)\s*=\s*Archive\s*\(\s*["']([^"']+)["']\s*,\s*domain_type\s*=\s*["']([^"']+)["']\s*,\s*technology\s*=\s*["']([^"']+)["']/g }
        ];

        for (const pattern of componentPatterns) {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                factory.components.push({
                    variable: match[1],
                    name: match[2],
                    domainType: match[3],
                    technology: match[4],
                    type: pattern.type
                });
            }
        }

        // Extract connections
        const connectionRegex = /factory\.add_connection\s*\(\s*(\w+)\s*,\s*(\w+)\s*,\s*["']([^"']*)["']\s*,\s*["']([^"']*)["']/g;
        let connectionMatch;
        while ((connectionMatch = connectionRegex.exec(code)) !== null) {
            factory.connections.push({
                source: connectionMatch[1],
                destination: connectionMatch[2],
                label: connectionMatch[3],
                technology: connectionMatch[4]
            });
        }

        // Return null if no components found
        if (factory.components.length === 0) {
            return null;
        }

        return factory;
    }

    /**
     * Check if code contains IAC Factory imports
     */
    static hasIacFactoryImport(code: string): boolean {
        return code.includes('from iac_factory import') || 
               code.includes('import iac_factory');
    }

    /**
     * Get component by variable name
     */
    static getComponentByVariable(factory: IacFactory, variable: string): IacComponent | undefined {
        return factory.components.find(c => c.variable === variable);
    }
}
