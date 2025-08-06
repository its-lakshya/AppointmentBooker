import { FormLabel } from "../ui/form";

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children} *
  </FormLabel>
)

export default RequiredLabel;