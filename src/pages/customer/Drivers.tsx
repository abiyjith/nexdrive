import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import RequestDriverModal from "../../components/RequestDriverModal";

type Driver = {
  user_id: string;
  first_name: string;
  last_name: string;
  rating: number | null;
  available_dates?: string[];
  image_url?: string | null;
};

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers(date?: string) {
    setLoading(true);
    setMessage(null);

    const { data: driverProfiles } = await supabase
      .from("profiles")
      .select(`
        user_id,
        first_name,
        last_name,
        image_url,
        ratings:ratings ( rating )
      `)
      .eq("is_driver", true)
      .eq("is_banned", false);

    const { data: availability } = await supabase
      .from("driver_availability")
      .select("driver_id, available_date");

    const availabilityMap: Record<string, string[]> = {};
    (availability || []).forEach((a) => {
      if (!availabilityMap[a.driver_id]) {
        availabilityMap[a.driver_id] = [];
      }
      availabilityMap[a.driver_id].push(a.available_date);
    });

    let processedDrivers: Driver[] = (driverProfiles || []).map(
      (d: any) => {
        const ratings = d.ratings?.map((r: any) => r.rating) || [];
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a: number, b: number) => a + b, 0) /
              ratings.length
            : null;

        return {
          user_id: d.user_id,
          first_name: d.first_name,
          last_name: d.last_name,
          image_url: d.image_url,
          rating: avgRating,
          available_dates: availabilityMap[d.user_id] || [],
        };
      }
    );

    if (date) {
      processedDrivers = processedDrivers.filter(
        (d) =>
          d.available_dates &&
          d.available_dates.length > 0 &&
          d.available_dates.includes(date)
      );

      if (processedDrivers.length === 0) {
        setMessage("No drivers available for the selected date.");
      }
    }

    setDrivers(processedDrivers);
    setLoading(false);
  }

  function handleSearch() {
    if (!selectedDate) loadDrivers();
    else loadDrivers(selectedDate);
  }

  if (loading) return <p>Loading drivers...</p>;

  return (
    <div className="page">
      <h2>🧑‍✈️ Available Drivers</h2>

      <div className="card">
        <label>Select date to check availability</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {message && <div className="alert info">{message}</div>}

      <div className="grid">
        {drivers.map((d) => (
          <div key={d.user_id} className="card">
            {d.image_url && (
              <img
                src={
                  supabase.storage
                    .from("profile-images")
                    .getPublicUrl(d.image_url).data.publicUrl
                }
                alt="Driver"
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            )}

            <h3>
              {d.first_name} {d.last_name}
            </h3>

            <p>
              <b>Rating:</b>{" "}
              {d.rating ? d.rating.toFixed(1) + " ⭐" : "Not rated yet"}
            </p>

            <button onClick={() => setActiveDriver(d)}>
              Request Driver
            </button>
          </div>
        ))}
      </div>

      {activeDriver && (
        <RequestDriverModal
          driverId={activeDriver.user_id}
          driverName={`${activeDriver.first_name} ${activeDriver.last_name}`}
          onClose={() => setActiveDriver(null)}
        />
      )}
    </div>
  );
}