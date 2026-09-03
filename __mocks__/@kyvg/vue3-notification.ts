import { vi } from "vitest";

export const notify = vi.fn();

interface NotificationItem {
  id: number;
  title: string;
  text: string;
  type?: string;
}

export default {
  name: "Notifications",
  template: `
    <div data-testid="notifications">
      <div v-for="item in items" :key="item.id">
        <!-- Solo exponemos el slot; App.vue se encarga de renderizar el botón de cierre -->
        <slot name="body" :item="item" :close="() => remove(item.id)" />
      </div>
    </div>
  `,
  data(): { items: NotificationItem[] } {
    return {
      items: [
        { id: 1, title: "Error Title", text: "Error text", type: "error" },
        { id: 2, title: "Warn Title", text: "Warn text", type: "warn" },
        { id: 3, title: "Info Title", text: "Info text", type: "info" },
        { id: 4, title: "Success Title", text: "Success text", type: "success" },
        { id: 5, title: "Default Title", text: "Default text" },
      ],
    };
  },
  methods: {
    remove(this: { items: NotificationItem[] }, id: number) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },
  },
};
