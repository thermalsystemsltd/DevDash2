export interface LoginCredentials {
  companyName: string;
  email: string;
  password: string;
}

export interface UserData {
  userID: number;
  username: string;
  companyID: number;
  companyName: string;
  email: string;
  roles: string[];
  profilePic: string;
}

export interface AuthResponse {
  message: string;
  userData: UserData;
}

export interface TokenCheckResponse {
  message: string;
  data?: {
    companyID: number;
    companyName: string;
  };
}