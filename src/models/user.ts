import {Membership} from './membership';
import {ServerInformation} from './server-information';

export class User {
    public slug: string = '';
    public tagline: string;
    public username: string;
    public name: string;
    public isStaff: boolean = false;
    public email: string;
    public avatarUrl?: string;
    public creationDate: Date;
    public token: string;
    public id: string;
    private orgRoles: {[key: string]: Membership}

    public constructor(data: any = {}, token?: string) {
        this.tagline = data.tagline || '';
        this.username = data.username || "";
        this.name = data.name || "";
        this.email = data.email || "";
        this.isStaff = data.is_staff || false;
        this.id = data.id || "";
        this.orgRoles = data.orgRoles || {};

        if ('slug' in data) {
            this.slug = data.slug;
        }

        if (data.avatar) {
            this.avatarUrl = data.avatar.thumbnail;
        }

        if (data.created_at) {
            this.creationDate = new Date(data.created_at);
        } else {
            this.creationDate = new Date();
        }

        this.token = data.token || token || null;
    }

    public toJson(): any {
        let rawData : {[key: string]: any} = {
            "username" : this.username,
            "name" : this.name,
            "email" : this.email,
            "created_at" : this.creationDate,
            "is_staff" : this.isStaff,
            "id" : this.id,
            "token" : this.token,
            "avatar": {},
            "orgRoles": this.orgRoles
        }
        if (this.avatarUrl) {
            rawData.avatar["thumbnail"] = this.avatarUrl;
        }
        return rawData;
      }

    public static Unserialize(obj: {[key: string]: any}) : {user: User, server: ServerInformation | undefined} {
        let user = new User(obj);
        let server: ServerInformation | undefined = undefined;
    
        if (obj['server']) {
          server = obj['server'];
        } 
    
        return {user, server};
      }

    public getFullName(): string {
        let name: string = "";
        if (this.name) {
            name = this.name;
        } else {
            name = this.username;
        }
        return name;
    }

    public getUsername() {
        return "@" + this.username;
    }

    public getAvatar() {
        if (this.avatarUrl) {
            return this.avatarUrl;
        } else {
            return "";
        }
    }

    public setOrgRoles(roles: {[key:string]: Membership}) {
        this.orgRoles = roles;
    }

    public canReadProperties(orgSlug: string): boolean {
        if (orgSlug in this.orgRoles){
            return this.isStaff || this.orgRoles[orgSlug].permissions['can_read_device_properties'] || false;
        }
        return this.isStaff;
    }

    public canModifyDevice(orgSlug: string): boolean {
        if (orgSlug in this.orgRoles){
            return this.isStaff || this.orgRoles[orgSlug].permissions['can_modify_device'] || false;
        }
        return this.isStaff;
    }

    public canModifyStreamVariables(orgSlug: string): boolean {
        if (orgSlug in this.orgRoles){
            return this.isStaff || this.orgRoles[orgSlug].permissions['can_modify_stream_variables'] || false;
        }
        return this.isStaff;
    }

    public canResetDevice(orgSlug: string): boolean {
        if (orgSlug in this.orgRoles){
            return this.isStaff || this.orgRoles[orgSlug].permissions['can_reset_device'] || false;
        }
        return this.isStaff;
    }
}