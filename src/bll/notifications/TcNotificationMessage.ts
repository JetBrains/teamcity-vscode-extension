export interface TcNotificationMessage {
    myBuildId: number;
    myBuildTypeId: string;
    myDetailLink: string;
    myEventType: {
        myName: string;
        myStatus: number;
        myEventId: number;
    };
    myIsImportant: boolean;
    myIsPersonalBuild: boolean;
    myMessage: string;
    myModificationCounter: number;
    myProjectId: string;
    myTime: number;
}
