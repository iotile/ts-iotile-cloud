export class Membership {
    public user: string;
    public isActive: boolean;
    public permissions: any;
    public role: any;

    public constructor(data: any = {}){
        this.user = data.user;
        this.isActive = data.is_active;
        this.permissions = data.permissions;
        this.role = data.role;
    }

    public toJson(): any {
        let rawData = {
            "user" : this.user,
            "is_active": this.isActive,
            "permissions": this.permissions,
            "role": this.role
        }

        return rawData;
      }

    public static Unserialize(obj: {}) : Membership {
        let membership = new Membership(obj);
    
        return membership;
      }
}