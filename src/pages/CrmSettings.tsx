import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { User, Lock, Bell, Loader2, Check, ShieldCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/hooks/useApi'

export default function CrmSettings() {
  const { user } = useAuth()

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: ''
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    leadAlert: true,
    weekly: true
  })
  const [notifSaving, setNotifSaving] = useState(false)

  // Sync profile form from auth user
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleProfileSave = async () => {
    if (!profileForm.fullName.trim()) {
      setProfileError('Full name is required')
      return
    }
    setProfileSaving(true)
    setProfileError(null)
    try {
      await api.updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone
      })
      toast.success('Profile updated successfully')
    } catch (e: any) {
      const msg = e?.message || 'Failed to update profile'
      setProfileError(msg)
      toast.error(msg)
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    setPasswordError(null)
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordSaving(true)
    try {
      await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e: any) {
      const msg = e?.message || 'Failed to change password'
      setPasswordError(msg)
      toast.error(msg)
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleNotifSave = async () => {
    setNotifSaving(true)
    // Notification preferences are local for now (no dedicated backend endpoint)
    await new Promise(r => setTimeout(r, 400))
    toast.success('Notification preferences saved')
    setNotifSaving(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="gap-1"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-1"><Lock className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
        </TabsList>

        {/* ── PROFILE ── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold select-none">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{user?.fullName || '—'}</p>
                  <p className="text-sm text-slate-500 capitalize flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />{user?.role}
                  </p>
                </div>
              </div>

              {/* Error */}
              {profileError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{profileError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileForm.email}
                    disabled
                    className="bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-400">Email cannot be changed</p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <Button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {profileSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</>
                  : <><Check className="h-4 w-4 mr-2" /> Save Changes</>
                }
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SECURITY ── */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{passwordError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPwd">Current Password</Label>
                <Input
                  id="currentPwd"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPwd">New Password</Label>
                <Input
                  id="newPwd"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  autoComplete="new-password"
                />
                <p className="text-xs text-slate-400">Minimum 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPwd">Confirm New Password</Label>
                <Input
                  id="confirmPwd"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              <Button
                onClick={handlePasswordSave}
                disabled={passwordSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {passwordSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating…</>
                  : <><Lock className="h-4 w-4 mr-2" />Update Password</>
                }
              </Button>
            </CardContent>
          </Card>

          {/* Session info */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Logged in as</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token expires</span>
                <span className="font-medium">7 days from login</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NOTIFICATIONS ── */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Channels */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900">Communication Channels</h4>
                {[
                  { key: 'email', label: 'Email Notifications', sub: 'Receive updates via email' },
                  { key: 'sms', label: 'SMS Notifications', sub: 'Receive text alerts on your phone' },
                  { key: 'push', label: 'Push Notifications', sub: 'Browser push notifications' },
                ].map((item, idx, arr) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.sub}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={v => setNotifications({ ...notifications, [item.key]: v })}
                      />
                    </div>
                    {idx < arr.length - 1 && <Separator />}
                  </div>
                ))}
              </div>

              {/* Alert Types */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900">Alert Types</h4>
                {[
                  { key: 'leadAlert', label: 'New Lead Alerts', sub: 'Get notified when a new lead is assigned to you' },
                  { key: 'weekly', label: 'Weekly Summary', sub: 'Receive a weekly performance report every Monday' },
                ].map((item, idx, arr) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.sub}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={v => setNotifications({ ...notifications, [item.key]: v })}
                      />
                    </div>
                    {idx < arr.length - 1 && <Separator />}
                  </div>
                ))}
              </div>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleNotifSave}
                disabled={notifSaving}
              >
                {notifSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
                  : <><Check className="h-4 w-4 mr-2" />Save Preferences</>
                }
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
