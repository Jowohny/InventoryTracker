export default defineNuxtPlugin(() => {
    return {
      provide: {
        locally: {
          setItem: (key: string, value: any) => {
            localStorage.setItem(key, JSON.stringify(value));
          },
          getItem: (key: string) => {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : null;
          },
          removeItem: (key: string) => {
            localStorage.removeItem(key);
          }
        }
      }
    };
  });
  