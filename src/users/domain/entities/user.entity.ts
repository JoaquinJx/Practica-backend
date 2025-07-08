//ENTIDAD USUARIO
export class User {
  readonly id: string;
  email: string;
  password?: string;
  name?: string;
  avatarUrl?: string;
  role: string;
  createAt: Date;
  updateAt: Date;
}
