export interface ProjectTemplateDictionary {
    [ slug: string ]: ProjectTemplate;
}

export class ProjectTemplate {
    public name: string;
    public slug: string;
    public version: string;
    public extra: any;
    public rawData: any;

    constructor(data: any = {}) {
        this.name = data.name;
        this.slug = data.slug;
        this.version = data.version;
        this.extra = data.extra_data;
        this.rawData = data;

        if (!this.extra){
            this.extra = {
                mobile: {
                    projectTemplateSlug: "default",
                    waveform: false
                }
            }
        }
    }

    public toJson(): any {
        return this.rawData;
    }
}