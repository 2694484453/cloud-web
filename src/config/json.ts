//
export const zImageJson = (value) => {
  return {
    model: "z-image-turbo",
    input: {
      messages: [
        {
          role: "user",
          content: [
            {
              text: value.prompt,
            }
          ]
        }
      ]
    },
    parameters: {
      prompt_extend: value.extend,
      size: value.width + "*" + value.height
    }
  }
}
//
export const acgJson = (value) => {
  return {
    prompt: value.prompt,
    negative_prompt: value.negative_prompt,
    width: value.width,
    height: value.height,
    steps: value.steps,
    cfg: value.cfg,
    model_index: value.model_index,
    seed: value.seed,
  }
}
