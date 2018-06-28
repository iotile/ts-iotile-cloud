import {guid} from "iotile-common";

export enum DeltaStatus {
    Applies = 0,
    Outdated = 1,
    Conflicted = 2
};

export interface SerializedDelta {
    guid: string;
    classname: string;
    slug: string;

    args: {[key: string]: any};
}

export abstract class ModelDelta<T> {
    public readonly classname: string;
    public readonly id: string;
    public readonly slug: string;

    constructor(name: string, slug: string, guidString?: string) {
        if (guidString == null) {
            this.id = guid();
        } else {
            this.id = guidString;
        }

        this.slug = slug;
        this.classname = name;
    }

    //Returns if this delta is still relavant or has been superceded by other changes to the model
    public abstract check(model: T): DeltaStatus;

    //Get a patch payload that could use used to update this model in IOTile.cloud
    public abstract getPatch(model: T): {[key: string]: any};

    //Update this model locally
    public abstract apply(model: T): any;
    protected abstract serializeArguments() : {};

    public serialize(): SerializedDelta {
        return {
            classname: this.classname,
            guid: this.id,
            slug: this.slug,
            args: this.serializeArguments()
        }
    }
}
