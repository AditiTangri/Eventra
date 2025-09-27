// Importing necessary React hooks and libraries
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // for animations
import mockEvents from "./eventsMockData.json"; // mock data file
import EventHero from "./EventHero"; // Hero section with search
import EventCard from "./EventCard"; // Card for displaying event details
import { Grid, List } from "lucide-react"; // icons for toggle view
import FeedbackButton from "../../components/FeedbackButton"; // Feedback button component
import EventCTA from "./EventCTA";
import Fuse from "fuse.js";

// -----------------------------
// Main Events Page Component
// -----------------------------
const EventsPage = () => {
  // State to store all events (raw data from mock file)
  const [events, setEvents] = useState([]);

  // State for filter type (all, upcoming, past, conference, workshop)
  const [filterType, setFilterType] = useState("all");

  // State for switching between grid view and list view
  const [viewMode, setViewMode] = useState("grid");

  // State for storing user’s search query (from search bar)
  const [searchQuery, setSearchQuery] = useState("");

  // State for storing the filtered + searched list of events
  const [filteredEvents, setFilteredEvents] = useState([]);

  const cardSectionRef = useRef();

  // -----------------------------
  // Load events from mock JSON when component mounts
  // -----------------------------
  useEffect(() => {
    setEvents(mockEvents); // Setting mock data as events
  }, []);

  // Fuse.js setup
  const fuse = new Fuse(events, {
    keys: ["title", "description", "location", "tags", "type"],
    threshold: 0.35, // adjust for fuzziness
  });

  // -----------------------------
  // Search handler function
  // -----------------------------
  const handleSearch = useCallback((query = "") => {
    setSearchQuery(query);

    let results = events;
    if (query.trim()) {
      results = fuse.search(query).map((res) => res.item);
    }

    // Apply filterType after fuzzy results
    const final = results.filter((event) => {
      return (
        filterType === "all" ||
        (filterType === "upcoming" && event.status === "upcoming") ||
        (filterType === "past" && event.status === "past") ||
        event.type === filterType
      );
    });

    setFilteredEvents(final);
  }, [events, filterType, fuse]);

  // Recalculate when filterType or events change
  useEffect(() => {
    handleSearch(searchQuery);
  }, [events, filterType, handleSearch, searchQuery]);

  // -----------------------------
  // Animation Variants
  // -----------------------------
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.2,
        duration: 0.6,
        ease: "easeOut"
      },
    },
  };

  const filterBarVariants = {
    hidden: { opacity: 0, y: -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behaviour: "smooth" });
  };

  // -----------------------------
  // JSX Render
  // -----------------------------
  return (
    // UPDATED: Main page background
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-indigo-200 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100">
      {/* Hero section will be updated in the next step */}
      <EventHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredEvents={filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      {/* Main content wrapper */}
      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Filters + Toggle View Section */}
        <motion.div
          className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          variants={filterBarVariants}
          initial="hidden"
          animate="show"
        >
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All" },
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
              { key: "conference", label: "Conferences" },
              { key: "workshop", label: "Workshops" },
            ].map((filter, index) => (
              <motion.button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                  filterType === filter.key
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700"
                }`}
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ 
                  scale: 0.95,
                  y: 0
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>

          {/* Toggle View Buttons (Grid / List) */}
          {/* UPDATED: Toggle container background */}
          <motion.div 
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { 
                delay: 0.5,
                duration: 0.4,
                ease: "easeOut"
              }
            }}
          >
            {/* Grid View Button */}
            <motion.button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              whileHover={{ 
                scale: 1.1,
                rotate: viewMode !== "grid" ? 5 : 0
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Grid size={16} />
            </motion.button>

            {/* List View Button */}
            <motion.button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              whileHover={{ 
                scale: 1.1,
                rotate: viewMode !== "list" ? -5 : 0
              }}
              whileTap={{ scale: 0.9 }}
            >
              <List size={16} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Event Cards Section */}
        <AnimatePresence mode="wait">
          {filteredEvents.length > 0 ? (
            <motion.div
              key={filterType + viewMode} // re-trigger animation when filter/view changes
              className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" // grid view
                  : "grid-cols-1 max-w-4xl mx-auto" // list view
              }`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              // UPDATED: "No Events Found" message styles
              className="relative overflow-hidden rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-indigo-900/20 dark:to-purple-900/20 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
              // ... animation props
            >
              {/* NOTE: You'll need to update the text colors inside this block as well */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* These components will be updated in the next steps */}

      <EventCTA />

      <FeedbackButton />
    </div>
  );
};

export default EventsPage;
