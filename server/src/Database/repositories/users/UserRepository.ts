import { IUserRepository } from '../../../Domain/repositories/users/IUserRepository';
import { User } from '../../../Domain/models/User';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getReadConnection, getWriteConnection } from '../../connection/DbConnectionPool';

export class userRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    try {
      
    }
  }
}