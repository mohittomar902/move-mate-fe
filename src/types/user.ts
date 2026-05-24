export interface User {
  id: string
  fullName: string
  phone: string
  email?: string
  profileImage?: string
  rating: string
  verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'
  isAdmin?: boolean
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}
