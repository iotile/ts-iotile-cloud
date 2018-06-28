export function streamInDevice(streamSlug: string, deviceSlug: string) {
    if (deviceSlug.length < 3) {
        return false;
    }

    let deviceGID = deviceSlug.substr(3);
    let streamParts = streamSlug.split('--');
    if (streamParts.length != 4) {
        return false;
    }

    return (streamParts[2] === deviceGID);
}

export class DataConflictError {
    userMessage: string;
    message: string;

    constructor(userMessage: string, technicalMessage: string = "") {
        this.userMessage = userMessage;
        this.message = technicalMessage;
    }
}
