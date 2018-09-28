export class StreamerReport {
    public readonly id: number;
    public readonly streamer: string;
    public readonly originalLastId: number;
    public readonly originalFirstId: number;
    public readonly firstId: number;
    public readonly lastID: number;
    public readonly created: Date;
    public readonly sent: Date;

    constructor(data: any = {}) {
        this.id = data.id;
        this.streamer = data.streamer;
        this.originalLastId = data.original_last_id;
        this.originalFirstId = data.original_first_id;
        this.firstId = data.actual_first_id;
        this.lastID = data.actual_last_id; 
        this.created = new Date(data.created_on);
        this.sent = new Date(data.sent_timestamp);   
    }
}