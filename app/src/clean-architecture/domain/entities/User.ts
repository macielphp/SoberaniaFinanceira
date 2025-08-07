// Domain Entity: User
// Representa um usuário no sistema

// Interface for User constructor
export interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
  createdAt?: Date;
}

export class User {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _email: string;
  private readonly _password: string;
  private readonly _isActive: boolean;
  private readonly _createdAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get password(): string { return this._password; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date { return this._createdAt; }

  // Validation
  private validate(): void {
    this.validateName();
    this.validateEmail();
    this.validatePassword();
  }

  private validateName(): void {
    if (!this._name || this._name.trim() === '') {
      throw new Error('User name cannot be empty');
    }
  }

  private validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._email)) {
      throw new Error('Invalid email format');
    }
  }

  private validatePassword(): void {
    if (!this._password || this._password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }

  // Business methods
  activate(): User {
    return new User({
      ...this.getProps(),
      password: this._password,
      isActive: true
    });
  }

  deactivate(): User {
    return new User({
      ...this.getProps(),
      password: this._password,
      isActive: false
    });
  }

  changePassword(newPassword: string): User {
    return new User({
      ...this.getProps(),
      password: newPassword
    });
  }

  updateProfile(name: string, email: string): User {
    return new User({
      ...this.getProps(),
      password: this._password,
      name,
      email
    });
  }

  isActiveUser(): boolean {
    return this._isActive;
  }

  private getProps(): Omit<UserProps, 'password'> {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      isActive: this._isActive,
      createdAt: this._createdAt
    };
  }

  equals(other: User): boolean {
    return this._id === other._id;
  }

  toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      isActive: this._isActive,
      createdAt: this._createdAt
    };
  }
}
