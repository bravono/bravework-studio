export const CourseNotFound = ({ courseId }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
    <h2 className="text-4xl font-extrabold text-red-600">Course Not Found</h2>
    <p className="text-xl text-gray-500">
      Oops! The course you are looking for may not exist or the link may be
      broken.
    </p>
    <a
      href="/courses"
      onClick={(e) => {
        e.preventDefault();
        window.location.href = "/courses";
      }}
      className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition duration-150"
    >
      Browse Other Courses
    </a>
  </div>
);
