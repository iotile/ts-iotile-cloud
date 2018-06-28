export class Org {
  public slug: string;
  public name: string;
  public thumbnailUrl?: string;
  public tinyUrl?: string;
  public rawData: any;

  constructor(data: any = {}) {
    this.slug = data.slug;
    this.name = data.name;
    this.rawData = data;
    if (data.avatar) {
      this.thumbnailUrl = data.avatar.thumbnail;
      this.tinyUrl = data.avatar.tiny;
    }
  }

  public toJson(): any {
    return this.rawData;
  }
}
