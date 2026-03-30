"use client"
import { useState, useEffect } from 'react'
import { getProfile, updateProfile as updateProfileApi, Profile } from '@/lib/api'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile()
        setProfile(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const update = async (data: Partial<Profile>) => {
    try {
      setSaving(true)
      const updated = await updateProfileApi(data)
      setProfile(updated)
      return updated
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  return { profile, loading, saving, update }
}
