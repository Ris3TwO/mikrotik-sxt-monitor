/**
 * Credentials required to authenticate against a MikroTik device.
 */
export interface LoginCredentials {
  /** Target device IP address */
  ip: string;
  /** Authentication username */
  user: string;
  /** Authentication password */
  pass: string;
}