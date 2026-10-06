import type { Role } from '../types'

interface Props { name?: string; role?: Role; size?: 'sm' | 'md' | 'lg' | 'xl'; src?: string }

const avatarByRole: Record<Role, string> = {
  ADMIN: '/avatars/admin.svg',
  DOCTOR: '/avatars/doctor.svg',
  PATIENT: '/avatars/patient.svg',
  RECEPTIONIST: '/avatars/receptionist.svg',
}

export function Avatar({ name = 'User', role = 'PATIENT', size = 'md', src }: Props) {
  return <img className={`avatar avatar-${size}`} src={src || avatarByRole[role]} alt={`${name} avatar`} />
}
