import {ServerInformation, Membership} from 'ng-iotile-cloud';

export class User {
    public username: string;
    public name: string;
    public isStaff: boolean = false;
    public email: string;
    public avatarUrl?: string;
    public creationDate: string;
    public token: string;
    public id: string;
    private orgRoles: {[key: string]: Membership}

    public constructor(data: any = {}, token?: string) {
        this.username = data.username || "";
        this.name = data.name || "";
        this.email = data.email || "";
        this.creationDate = data.created_at || Date.now();
        this.isStaff = data.is_staff || false;
        this.id = data.id || "";
        this.orgRoles = data.orgRoles || {};

        if (data.avatar) {
            this.avatarUrl = data.avatar.thumbnail;
        }

        this.token = data.token || token || null;
    }

    public toJson(): any {
        let rawData = {
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

    public static Unserialize(obj: {}) : {user: User, server: ServerInformation} {
        let user = new User(obj);
        let server: ServerInformation;
    
        if (obj['server']) {
          server = obj['server'];
        } 
    
        return {user, server};
      }

    public getFullName() {
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
}