<template>
  <div>
    <input
      id="collapse-checkbox"
      class="collapsible-checkbox"
      type="checkbox"
      checked
    />
    <label for="collapse-checkbox" class="collapsible-label">
      <label
        class="collapsible-header-label"
        v-if="group.option != undefined"
        :for="group.option.id"
      >
        <input
          :id="group.option.id"
          type="checkbox"
          :name="group.option.name"
          v-model="group.option.hide"
          :true-value="false"
          :false-value="true"
        />
        {{ group.option.name }}
      </label>
    </label>
    <div class="collapsible">
      <template v-for="option of group.options">
        <label
          :key="option.name"
          :for="option.id"
          class="checkbox-label"
          :disabled="group.option != undefined ? group.option.hide : false"
        >
          <input
            :id="option.id"
            type="checkbox"
            :name="option.name"
            v-model="option.hide"
            :true-value="false"
            :false-value="true"
            :disabled="group.option != undefined ? group.option.hide : false"
          />
          {{ option.name }}
        </label>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: ["group"]
};
</script>

<style scoped>
.collapsible-header-label:hover {
  font-weight: bold;
}

.collapsible-label {
  --collapsible-label-bg-color: rgb(220, 247, 255);
  border: var(--inner-border-property);
  background-color: var(--collapsible-label-bg-color);
  border-radius: 0.5rem;
  padding: 10px;
  margin: 0 0 0px;
  display: block;

  transition: border-radius 0.3s ease-in-out;
}

.collapsible-label:hover {
  --collapsible-label-bg-color: rgb(173, 236, 255);
}

.collapsible-label::before {
  content: " ";
  display: inline-block;

  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 5px solid currentColor;

  vertical-align: middle;
  margin-right: 0.7rem;
  transform: translateY(-2px);

  transition: transform 0.2s ease-out;
}

.collapsible-checkbox:checked + .collapsible-label::before {
  transform: rotate(90deg) translateX(-3px);
}

.collapsible-checkbox:checked + .collapsible-label {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.collapsible-checkbox {
  display: none;
}

.collapsible-checkbox:not(:checked) + .collapsible-label + .collapsible {
  max-height: 0;

  border-color: white;
}

.collapsible {
  max-height: 20rem;
  overflow: hidden;
  border: var(--inner-border-property);
  border-width: 0 1px 1px;

  transition: max-height 0.7s ease-in-out, border-color 0.5s ease-in-out;
}
</style>