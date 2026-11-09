export interface Agent {
  id: string;
  slug: string;
  name: string;
  /** Job title as it appears on a business card. */
  role: string;
  /** Where this agent actually works, used for the roster filter. */
  territories: string[];
  /** What they are known for, in the agent's own register. */
  specialties: string[];
  /** Two or three sentences, first person removed. */
  bio: string;
  phone: string;
  email: string;
  /** Portrait. Square crop. */
  image: string;
  /** Year they joined the agency, used to derive years of service. */
  joined: number;
  /** Languages spoken, T&T-relevant. */
  languages: string[];
  /** Professional body registration, shown as a credential line. */
  credential?: string;
}
