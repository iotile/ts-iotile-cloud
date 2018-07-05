export interface ProjectTemplateDictionary {
    [ slug: string ]: ProjectTemplate;
}

export class ProjectTemplate {
    [key: string]: any;
    
    public id: number;
    public name: string;
    public slug: string;
    public version: string;
    public extraData: any;
    public org: string;
    public rawData: any;

    constructor(data: any = {}) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.version = data.version;
        this.extraData = data.extra_data;
        this.org = data.org;
        this.rawData = data;

        if (!this.extraData){
            this.extraData = {
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