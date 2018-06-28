export class Streamer {
    public readonly id: number;
    public readonly slug: string;
    public readonly device: string;
    public readonly index: number;
    public readonly lastID: number;

    constructor(data: any = {}) {
        this.id = data.id;
        this.slug = data.slug;
        this.device = data.device;
        this.index = data.index;
        this.lastID = data.last_id;    
    }
}
