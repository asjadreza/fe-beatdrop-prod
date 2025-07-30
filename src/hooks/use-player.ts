import { create } from "zustand"

interface PlayerStore {
  ids: string[]
  activeId?: string
  setId: (id: string) => void
  setIds: (ids: string[]) => void
  reset: () => void
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  setId: (id: string) => {
    if (id && id !== 'undefined') {
      set({ activeId: id });
    } else {
      set({ activeId: undefined });
    }
  },
  setIds: (ids: string[]) => {
    const validIds = ids.filter(id => id && id !== 'undefined');
    set({ ids: validIds });
  },
  reset: () => set({ ids: [], activeId: undefined }),
}))

export default usePlayer 