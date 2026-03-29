import { User } from "../../models/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  getById(id: number): Promise<User>;
  getByUsername(username: string): Promise<User>;
  getByEmail(email: string): Promise<User>;
  getAll(): Promise<User[]>;
  update(user: User): Promise<User>;
  updateRole(id: number, role: string): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  exists(id: number): Promise<boolean>;
  searchByUsername(query: string): Promise<User[]>;
  follow(followerId: number, followingId: number): Promise<boolean>;
  unfollow(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(id: number): Promise<User[]>;
  getFollowing(id: number): Promise<User[]>;

}