

// ENTIDAD USUARIO (CLASE)
export class User {
  readonly id: string;
  email: string;
  password: string; // Asumimos que es requerido en DB y aquí para el dominio completo
  name?: string;
  avatarUrl?: string;
  role: string; // Asumimos que es requerido en DB y aquí, con un valor por defecto
  createdAt: Date; // Nombre consistente con Prisma
  updatedAt: Date; // Nombre consistente con Prisma

  // Constructor para crear una instancia de la entidad User.
  // Recibe un objeto con los datos necesarios (idealmente ya validados y hasheados por el servicio).
  constructor(data: {
    email: string;
    password: string;
    name?: string;
    avatarUrl?: string;
    role?: string;
    id: string; // Para reconstruir desde la persistencia
    createdAt?: Date; // Para reconstruir desde la persistencia
    updatedAt?: Date; // Para reconstruir desde la persistencia
  }) {
    this.email = data.email;
    this.password = data.password; // Ya debe venir hasheada
    this.name = data.name;
    this.avatarUrl = data.avatarUrl;
    this.role = data.role || "user"; // Valor por defecto a nivel de dominio
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

 
  static fromPersistence(data: any): User { 
    return new User({
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      avatarUrl: data.avatarUrl,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  // Puedes añadir métodos de negocio aquí, por ejemplo:
  updateName(newName: string) {
    this.name = newName;
    this.updatedAt = new Date();
  }

}
export class CreateUser{
  email:string;
  password:string;
  name?:string;
  avatarUrl?:string;
  role?:string;

}
export class User1{
  id:string;
  email:string;
  password:string;
  name?:string;
  avatarUrl?:string;
  role:string;
  createdAt:Date;
  updatedAt:Date;
}