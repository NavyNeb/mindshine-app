import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchTracks } from "./content.api";

export const useTracks = () => useQuery({ queryKey: ["tracks"], queryFn: fetchTracks });
export const useCategories = () => useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
