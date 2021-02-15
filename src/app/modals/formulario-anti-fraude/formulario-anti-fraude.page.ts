import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { StorageService } from '../../providers/storage.service';
import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';
import { DatabaseService } from '../../providers/database.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../providers/auth.service';

@Component({
  selector: 'app-formulario-anti-fraude',
  templateUrl: './formulario-anti-fraude.page.html',
  styleUrls: ['./formulario-anti-fraude.page.scss'],
})
export class FormularioAntiFraudePage implements OnInit {
  form: FormGroup;
  ver_errores: boolean = false;
  i18n: any; 

  constructor (private toastController: ToastController,
    private viewCtrl: ModalController,
    private database: DatabaseService,
    private loadingCtrl: LoadingController,
    private storage: StorageService,
    private translateService: TranslateService,
    private auth: AuthService) { }

  ngOnInit () {
    let nombres = '';
    let apellidos = '';
    let email = '';
    let direccion = '';
    let pais = '';
    let ciudad = '';
    let telefono = '';
    let pais_code = '';

    if (this.auth.user.pagador_nombres !== null && this.auth.user.pagador_nombres !== undefined) {
      nombres = this.auth.user.pagador_nombres;
    } else {
      if (this.auth.user.first_name !== null && this.auth.user.first_name !== undefined) {
        nombres = this.auth.user.first_name;
      }
    }

    if (this.auth.user.pagador_apellidos !== null && this.auth.user.pagador_apellidos !== undefined) {
      apellidos = this.auth.user.pagador_apellidos;
    } else {
      if (this.auth.user.last_name !== null && this.auth.user.last_name !== undefined) {
        apellidos = this.auth.user.last_name;
      }
    }

    if (this.auth.user.pagador_email !== null && this.auth.user.pagador_email !== undefined) {
      email = this.auth.user.pagador_email;
    } else {
      if (this.auth.user.email !== null && this.auth.user.email !== undefined) {
        email = this.auth.user.email;
      }
    }

    if (this.auth.user.pagador_direccion !== null && this.auth.user.pagador_direccion !== undefined) {
      direccion = this.auth.user.pagador_direccion;
    }

    if (this.auth.user.pagador_pais !== null && this.auth.user.pagador_pais !== undefined) {
      pais = this.auth.user.pagador_pais;
    }

    if (this.auth.user.pagador_ciudad !== null && this.auth.user.pagador_ciudad !== undefined) {
      ciudad = this.auth.user.pagador_ciudad;
    }

    if (this.auth.user.pagador_telefono !== null && this.auth.user.pagador_telefono !== undefined) {
      telefono = this.auth.user.pagador_telefono;
    }

    if (this.auth.user.pagador_pais_code !== null && this.auth.user.pagador_pais_code !== undefined) {
      pais_code = this.auth.user.pagador_pais_code;
    }

    this.form = new FormGroup({
      nombres: new FormControl (nombres, [Validators.required]),
      apellidos: new FormControl (apellidos, [Validators.required]),
      email: new FormControl (email, [Validators.required, Validators.email]),
      direccion: new FormControl (direccion, [Validators.required]),
      pais: new FormControl (pais, [Validators.required]),
      ciudad: new FormControl (ciudad, [Validators.required]),
      telefono: new FormControl (telefono, [Validators.required]),
      pais_code: new FormControl (pais_code, [Validators.required]),
    });

    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
      });
    });
  }

  async submit () {
    if (this.form.valid) {
      const loading = await this.loadingCtrl.create ({
        message: this.i18n.procesando_informacion
      });

      loading.present ();

      let request: any = {
        pagador_nombres: this.form.value.nombres,
        pagador_apellidos: this.form.value.apellidos,
        pagador_email: this.form.value.email,
        pagador_direccion: this.form.value.direccion,
        pagador_pais: this.form.value.pais,
        pagador_ciudad: this.form.value.ciudad,
        pagador_telefono: this.form.value.telefono,
        pagador_pais_code: this.form.value.pais_code
      };

      this.database.update_user (this.auth.user.id, request).then (() => {
        loading.dismiss ();
        this.viewCtrl.dismiss (this.form.value, 'ok');
      }, error => {
        console.log (error);
        loading.dismiss ();
        this.viewCtrl.dismiss (this.form.value, 'ok');
      });
    } else {
      const toast = await this.toastController.create({
        message: 'Complete todos los campos',
        duration: 2000
      });
      toast.present ();
      this.ver_errores = true;
    }
  }

  closeModal () {
    this.viewCtrl.dismiss (null, 'close');
  }

  async select_pais () {
    const modal = await this.viewCtrl.create({
      component: PaisesCodsPage
    });

    modal.onDidDismiss ().then (async (r: any) => {
      if (r.role === 'ok') {
        this.form.controls ['pais'].setValue (r.data.name);
        this.form.controls ['pais_code'].setValue (r.data.code);
      }
    });

    modal.present ();
  }
}
