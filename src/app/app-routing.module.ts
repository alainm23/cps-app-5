import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'appointment-date/:precio_extranjero/:precio_nacional/:nombre/:nombre_referencia/:descripcion',
    loadChildren: () => import('./pages/appointment-date/appointment-date.module').then( m => m.AppointmentDatePageModule)
  },
  {
    path: 'emergency',
    loadChildren: () => import('./pages/emergency/emergency.module').then( m => m.EmergencyPageModule)
  },
  {
    path: 'send-ambulance',
    loadChildren: () => import('./pages/send-ambulance/send-ambulance.module').then( m => m.SendAmbulancePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registry',
    loadChildren: () => import('./pages/registry/registry.module').then( m => m.RegistryPageModule)
  },
  {
    path: 'home-doctor/:id/:edit',
    loadChildren: () => import('./pages/home-doctor/home-doctor.module').then( m => m.HomeDoctorPageModule)
  },
  {
    path: 'home-doctor-check/:id/:type',
    loadChildren: () => import('./pages/home-doctor-check/home-doctor-check.module').then( m => m.HomeDoctorCheckPageModule)
  },
  {
    path: 'pharmacy-delivery/:id/:edit',
    loadChildren: () => import('./pages/pharmacy-delivery/pharmacy-delivery.module').then( m => m.PharmacyDeliveryPageModule)
  },
  {
    path: 'pharmacy-delivery-check/:id/:type',
    loadChildren: () => import('./pages/pharmacy-delivery-check/pharmacy-delivery-check.module').then( m => m.PharmacyDeliveryCheckPageModule)
  },
  {
    path: 'home-injection/:id/:edit',
    loadChildren: () => import('./pages/home-injection/home-injection.module').then( m => m.HomeInjectionPageModule)
  },
  {
    path: 'home-injection-check/:id/:type',
    loadChildren: () => import('./pages/home-injection-check/home-injection-check.module').then( m => m.HomeInjectionCheckPageModule)
  },
  {
    path: 'home-nurse/:id/:edit',
    loadChildren: () => import('./pages/home-nurse/home-nurse.module').then( m => m.HomeNursePageModule)
  },
  {
    path: 'home-nurse-check/:id/:type',
    loadChildren: () => import('./pages/home-nurse-check/home-nurse-check.module').then( m => m.HomeNurseCheckPageModule)
  },
  {
    path: 'transfer-ambulance/:id/:edit',
    loadChildren: () => import('./pages/transfer-ambulance/transfer-ambulance.module').then( m => m.TransferAmbulancePageModule)
  },
  {
    path: 'transfer-ambulance-check/:id/:type',
    loadChildren: () => import('./pages/transfer-ambulance-check/transfer-ambulance-check.module').then( m => m.TransferAmbulanceCheckPageModule)
  },
  {
    path: 'medical-escort/:id/:edit',
    loadChildren: () => import('./pages/medical-escort/medical-escort.module').then( m => m.MedicalEscortPageModule)
  },
  {
    path: 'medical-escort-check/:id/:type',
    loadChildren: () => import('./pages/medical-escort-check/medical-escort-check.module').then( m => m.MedicalEscortCheckPageModule)
  },
  {
    path: 'request-results/:id/:edit',
    loadChildren: () => import('./pages/request-results/request-results.module').then( m => m.RequestResultsPageModule)
  },
  {
    path: 'request-results-check/:id/:typ',
    loadChildren: () => import('./pages/request-results-check/request-results-check.module').then( m => m.RequestResultsCheckPageModule)
  },
  {
    path: 'appointment-specialty',
    loadChildren: () => import('./pages/appointment-specialty/appointment-specialty.module').then( m => m.AppointmentSpecialtyPageModule)
  },
  {
    path: 'appointment-checkout/:fecha/:nombre/:precio_nacional/:precio_extranjero/:medico_id/:id_con/:hor_con',
    loadChildren: () => import('./pages/appointment-checkout/appointment-checkout.module').then( m => m.AppointmentCheckoutPageModule)
  },
  {
    path: 'appointment-detail/:data',
    loadChildren: () => import('./pages/appointment-detail/appointment-detail.module').then( m => m.AppointmentDetailPageModule)
  },
  {
    path: 'appointment-history',
    loadChildren: () => import('./pages/appointment-history/appointment-history.module').then( m => m.AppointmentHistoryPageModule)
  },
  {
    path: 'orders-history',
    loadChildren: () => import('./pages/orders-history/orders-history.module').then( m => m.OrdersHistoryPageModule)
  },
  {
    path: 'confirm-ambulance/:id',
    loadChildren: () => import('./pages/confirm-ambulance/confirm-ambulance.module').then( m => m.ConfirmAmbulancePageModule)
  },
  {
    path: 'solicitud-rechazada-view',
    loadChildren: () => import('./pages/solicitud-rechazada-view/solicitud-rechazada-view.module').then( m => m.SolicitudRechazadaViewPageModule)
  },
  {
    path: 'formulario-anti-fraude',
    loadChildren: () => import('./modals/formulario-anti-fraude/formulario-anti-fraude.module').then( m => m.FormularioAntiFraudePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
