export enum Role {
  ADMIN = 'admin',
  PLAYER = 'player',
  HIRER = 'hirer',
}

export enum Tier {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum Position {
  GK = 'GK',
  LB = 'LB',
  CB = 'CB',
  RB = 'RB',
  LWB = 'LWB',
  RWB = 'RWB',
  CDM = 'CDM',
  CM = 'CM',
  CAM = 'CAM',
  LM = 'LM',
  RM = 'RM',
  LW = 'LW',
  RW = 'RW',
  LF = 'LF',
  CF = 'CF',
  RF = 'RF',
  ST = 'ST',
}

export enum PlayerType {
  PLAYER = 'player',
  COACH = 'coach',
  REFEREE = 'referee',
  CAMERAMAN = 'cameraman',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum TeamRequestStatus {
  CALLING_SOON = 'callingSoon',
  ADVANCE_PENDING = 'advancePending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum NationalTeamLevel {
  SENIOR = 'Senior',
  U23 = 'U-23',
  U20 = 'U-20',
  U19 = 'U-19',
  U18 = 'U-18',
  U17 = 'U-17',
  U16 = 'U-16',
  U15 = 'U-15',
}

export enum MatchType {
  FRIENDLY = 'friendly',
  GROUP_ROUND = 'groupRound',
  FINAL = 'final',
}

export enum VehicleType {
  CAR = 'car',
  MICROBUS = 'microbus',
  MINIBUS = 'minibus',
  BUS = 'bus',
  PICKUP = 'pickup',
}

// Vehicle & Cameraman bookings
export enum ServiceBookingStatus {
  ADVANCE_PENDING = 'advancePending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Shop orders
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ON_THE_WAY = 'onTheWay',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum OtpPurpose {
  EMAIL_VERIFY = 'emailVerify',
  PHONE_VERIFY = 'phoneVerify',
  PASSWORD_RESET = 'passwordReset',
  LOGIN = 'login',
}

export enum OtpChannel {
  EMAIL = 'email',
  SMS = 'sms',
}