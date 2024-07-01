export enum ErrorEnum {
  USER_NOT_FOUND = 'User not found',
  NO_ACTIVE_ORGANIZATION = 'User does not belong to an active organization',
  INVALID_OR_EXPIRED_OTP = 'Invalid or expired OTP',
  RETRY_OTP = 'Please try again later.',
  NO_MEMBERSHIP = 'User membership not found',
  NO_ORGANIZATION = 'Organization not found',
  DATABASE_CONNECTION_ERROR = 'Failed to connect to the database',
  DATABASE_DISCONNECTION_ERROR = 'Failed to disconnect from the database',
  ERROR_SEND_OTP = 'Error while sending OTP',
  ERROR_VALIDATE_OTP = 'Error while validating OTP',
}
