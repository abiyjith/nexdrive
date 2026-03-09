import { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"
import "../../styles/profile.css"

export default function Profile() {

  const { user } = useAuth()

  const [profile, setProfile] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    if (!user) return

    const snap = await getDoc(doc(db, "users", user.uid))

    if (snap.exists()) {
      setProfile(snap.data())
    }
  }

  const handleUpload = async () => {

    if (!file || !user) return

    try {

      setUploading(true)

      const storageRef = ref(storage, `profiles/${user.uid}`)

      await uploadBytes(storageRef, file)

      const url = await getDownloadURL(storageRef)

      await updateDoc(doc(db, "users", user.uid), {
        photoURL: url
      })

      setProfile({ ...profile, photoURL: url })

      alert("Profile photo updated!")

    } catch (err) {
      console.error(err)
      alert("Upload failed")
    }

    setUploading(false)
  }

  if (!profile) return <p>Loading...</p>

  return (
    <div className="profile-page">

      <div className="profile-card">

        <h2>PROFILE</h2>

        <img
          src={profile.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          className="profile-avatar"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          className="upload-btn"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>

        <div className="profile-info">

          <p><b>Name:</b> {profile.first_name} {profile.last_name}</p>

          <p><b>Email:</b> {profile.email}</p>

          <p><b>Username:</b> {profile.username}</p>

          <p><b>Role:</b> {profile.active_role}</p>

        </div>

      </div>

    </div>
  )
}