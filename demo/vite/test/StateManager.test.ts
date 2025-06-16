import { flushPromises, mount } from '@vue/test-utils'
import { defineFactoryStore, defineNuxoblivius, defineStore } from 'nuxoblivius';
import { describe, it, expect } from 'vitest'
import { defineComponent, h, nextTick } from "vue"

describe('StateManager', () => {
  defineNuxoblivius();

  class TestUserStore {
    public get commonName() {
      return `${this.lastName} ${this.firstName}`;
    }

    public constructor(
      public firstName: string = "Ryan",
      public lastName: string = "Gosling"
    ) { }
  }

  it('Working Like Singleton', async () => {
    // Setup:

    const useTestUserStore = defineStore(TestUserStore);

    // Create component:

    const component = defineComponent({
      setup(props, ctx) {
        const instance = useTestUserStore();

        return () => h("div", {}, [
          instance.commonName
        ]);
      },
    });

    // Mount:

    const wrapper = mount(component);

    // Test:

    expect(wrapper.text()).toContain('Gosling Ryan');

    useTestUserStore().lastName = "Unknown";

    await nextTick();
    await flushPromises();

    expect(wrapper.text()).toContain('Unknown Ryan');
  });

  it('Working like Factory', async () => {
    // Setup:

    const factoryUser = defineFactoryStore(TestUserStore);

    // Create component:

    var instance: TestUserStore = null as any;

    const component = defineComponent({
      setup(props, ctx) {
        instance = factoryUser(
          "Ivan",
          "Ivanov"
        );

        return () => h("div", {}, [
          instance.commonName
        ]);
      },
    });

    // Mount:

    const wrapper = mount(component);

    // Test:

    expect(wrapper.text()).toContain('Ivanov Ivan');

    instance.firstName = "Test";

    await nextTick();
    await flushPromises();

    expect(wrapper.text()).toContain('Ivanov Test');
  });
});

