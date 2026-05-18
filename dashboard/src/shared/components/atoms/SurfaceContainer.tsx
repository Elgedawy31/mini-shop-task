import { Card } from "./card";

function SurfaceContainer({ children }) {
  return <Card className="p-6 bg-card border-border">{children}</Card>;
}

export default SurfaceContainer;
