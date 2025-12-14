import { useState, useEffect, useCallback, use } from "react";
import { Plus, Monitor } from "lucide-react";
import { toast } from "react-toastify";
import { Rental } from "@/app/types/app";
import Link from "next/link";
import CreateRentalModal from "./CreateRentalModal";

export default function UserRentalsSection() {
  const KOBO_PER_NAIRA = 100;
  const [isCreateRentalModalOpen, setIsCreateRentalModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [error, setError] = useState();

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/rentals");
      if (!res.ok) throw new Error("Failed to fetch rentals.");
      const data: Rental[] = await res.json();
      setRentals(data);
      setCurrentPage(1); // Reset to the first page when new data is fetched
    } catch (err: any) {
      console.error("Error fetching rentals:", err);
      setError(err.message || "Failed to load rentals.");
      toast.error(err.message || "Failed to load rentals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  return (
    <div className="bg-gray-100 min-h-screen p-4 mt-10 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800">My Listing</h1>
          <button
            onClick={() => setIsCreateRentalModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-150 shadow-md"
          >
            <Plus size={20} />
            List New Device
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.length > 0 ? (
            rentals.map((rental) => (
              <div
                key={rental.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {rental.deviceName}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full mt-1">
                        {rental.deviceType}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      ₦{Number(rental.hourlyRate / KOBO_PER_NAIRA).toLocaleString()}/hr
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {rental.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Monitor size={16} />
                    <span>{rental.specs}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span
                      className={`text-sm font-medium ${
                        rental.status === "active"
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {rental.status === "active" ? "In Use" : "Not In Use"}
                    </span>
                    <Link
                      href={`/rentals/${rental.id}`}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
              <Monitor className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No rentals listed
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by listing your first device for rent.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsCreateRentalModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  List Device
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <CreateRentalModal
        isOpen={isCreateRentalModalOpen}
        onClose={() => setIsCreateRentalModalOpen(false)}
        onSuccess={fetchRentals}
      />
    </div>
  );
}
