"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import MaterialCard from "./MaterialCard";

interface Material {
  id: string;
  title: string;
  type: "video" | "text" | "url" | "podcast" | "quiz";
  shortDescription: string;
  fullDescription: string;
  content: any;
  tags: string[];
  createdAt: string;
  author: string;
}

interface MaterialSectionProps {
  title: string;
  type: "video" | "text" | "url" | "podcast" | "quiz";
  materials: Material[];
  icon: React.ReactNode;
  description: string;
}

const MaterialSection = ({ title, type, materials, icon, description }: MaterialSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getTypeColor = () => {
    switch (type) {
      case "video":
        return "text-knowledge-video";
      case "text":
        return "text-knowledge-text";
      case "url":
        return "text-knowledge-url";
      default:
        return "text-primary";
    }
  };

  const getTypeBackground = () => {
    switch (type) {
      case "video":
        return "bg-knowledge-video/10";
      case "text":
        return "bg-knowledge-text/10";
      case "url":
        return "bg-knowledge-url/10";
      default:
        return "bg-primary/10";
    }
  };

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 sm:p-3 rounded-lg ${getTypeBackground()}`}>
            <div className={getTypeColor()}>{icon}</div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary self-start sm:self-auto"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="h-4 w-4" />
              Свернуть
            </>
          ) : (
            <>
              <ChevronRight className="h-4 w-4" />
              Развернуть
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 fade-in">
          {materials.map((material, index) => (
            <div key={material.id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <MaterialCard material={material} />
            </div>
          ))}
          
          {materials.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground">
                <div className={`inline-flex p-4 rounded-full ${getTypeBackground()} mb-4`}>
                  <div className={getTypeColor()}>{icon}</div>
                </div>
                <p>No {type} materials available yet.</p>
                <p className="text-sm mt-1">Check back later for new content!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialSection;