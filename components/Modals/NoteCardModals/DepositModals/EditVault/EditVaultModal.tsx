import TabsComponent from "@/components/reusable/TabsComponent";
import { TabsDataModel } from "@/models/TabsModel";
import React, { useState } from "react";

interface EditVaultModalProps {
  tabsData: TabsDataModel[];
  logo: string;
}

const EditVaultModal: React.FC<EditVaultModalProps> = ({ tabsData, logo }) => {
  const [selected, setSelected] = useState();
  return (
    <TabsComponent
      tabsData={tabsData}
      logo={logo}
      inModal
      selected={selected}
      setSelected={setSelected}
    />
  );
};
export default EditVaultModal;
