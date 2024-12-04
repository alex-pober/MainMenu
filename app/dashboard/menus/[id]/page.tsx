import { MenuDetails } from '@/components/dashboard/menus/menu-details';
import { MenuBreadcrumbs } from '@/components/dashboard/menus/menu-breadcrumbs';

export default function MenuDetailsPage() {
  return (
    <>
      <MenuBreadcrumbs />
      <MenuDetails />
    </>
  );
}