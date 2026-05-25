import { CommunityType } from "../../enums/CommunityType";

export class CommunityDto
{
    public constructor (
        public id: number = 0,
        public name: string = '',
        public description: string | null = null,
        public rules: string | null = null,
        public type: CommunityType = CommunityType.Public,
        public avatar: string | null = null,
        public creatorId: number = 0,
        public memberCount: number = 0,
        public createdAt: Date | null = null
    ){}
}