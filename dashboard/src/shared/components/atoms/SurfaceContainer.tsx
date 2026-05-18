import { Card } from "./card";

function SurfaceContainer({ children }) {
  return (
    <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      {children}
    </Card>
  );
}

export default SurfaceContainer;
