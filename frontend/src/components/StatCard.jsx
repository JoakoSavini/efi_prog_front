// src/components/StatCard.jsx
const StatCard = ({ title, value, icon, bgColor, textColor }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className={`text-3xl font-semibold ${textColor}`}>{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
