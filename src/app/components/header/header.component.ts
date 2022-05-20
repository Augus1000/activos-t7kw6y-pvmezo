import { AuthService } from './../../services/auth.service';
import { Registry } from './../../models/registry';
import { RegistryService } from './../../services/registry.service';
import { Component, ElementRef, EventEmitter, OnInit, Output, TemplateRef, VERSION, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
/* import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs; */
import { IRegistry } from '../../interfaces/iregistry';
import { AssettypeService } from '../../services/assettype.service';
import { ConfigService } from '../../services/config.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { confirmPassword } from '../../validators/validators';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  public showCreateUserError: boolean;
  @Output() close: EventEmitter<boolean>;
  closeResult = '';
  public formCreateAccount: FormGroup;
  public allData: IRegistry;
  public showDetail: boolean;
  public showRegistries: boolean;
  public typeRegistry: string;
  public registrySelected: Registry;
 public listRegistries: IRegistry[]
 public fieldTextType: boolean;
  public repeatFieldTextType: boolean;

public correo:any;
public newUser:any;
public admin: any;
  constructor(
    private modalService: NgbModal,
    private rService: RegistryService,
    private authService: AuthService,
    private aService:AssettypeService,
    public config: ConfigService,
    private formBuilder: FormBuilder,
    private route: Router,
    private afd: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    public atService: AuthService
  ) 
  {
    this.newUser=this.afAuth.auth.currentUser.email;
 
    
    this.formCreateAccount = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', Validators.required),
      confirmPass: new FormControl('', Validators.required)
    })
   
     // Añado el validador de confirmar password al formgroup
     this.formCreateAccount.setValidators(confirmPassword);

     this.showCreateUserError = false;
      
    
    this.showDetail = false;
    this.typeRegistry = '';
    console.log('Loading External Scripts');
  }
  get email(){
    return this.formCreateAccount.get('email')
    
  }

  
  /**
   * Obtiene el formcontrol de pass
   */
  get pass(){
    return this.formCreateAccount.get('pass')
  }

  /**
   * Obtiene el formcontrol de confirmPass
   */
  get confirmPass(){
    return this.formCreateAccount.get('confirmPass')
  }

  open(content) {
    this.modalService.open(content)
  }

 

  checkboxes = [
    {
      "id": "lowercase",
      "label": "a-z",
      "library": "abcdefghijklmnopqrstuvwxyz",
      "checked": true
    }, {
      "id": "uppercase",
      "label": "A-Z",
      "library": "ABCDEFGHIJKLMNOPWRSTUVWXYZ",
      "checked": true
    }, {
      "id": "numbers",
      "label": "0-9",
      "library": "0123456789",
      "checked": true
    }, {
      "id": "symbols",
      "label": "!-?",
      "library": "!@#$%^&*-_=+\\|:;',.\<>/?~",
      "checked": false
    }
  ]
 
  
  dictionary: Array<String>;

  lowercase: Boolean = this.checkboxes[0].checked;
  uppercase: Boolean = this.checkboxes[1].checked;
  numbers: Boolean = this.checkboxes[2].checked;
  symbols: Boolean = this.checkboxes[3].checked;

  passwordLenght: Number = 4;
  buttonLabel: String = "Generar Contraseña Aleatoria";
  newPassword: String;
  currentRegistry: Registry;

  // Password length
  private updatePasswordLength(event) {
    this.passwordLenght = event.target.value;
  }

  // Checkbox value
  private updateCheckboxValue(event) {
    if (event.target.id == "lowercase")
      this.lowercase = event.target.checked;

    if (event.target.id == "uppercase")
      this.uppercase = event.target.checked;

    if (event.target.id == "numbers")
      this.numbers = event.target.checked;

    if (event.target.id == "symbols")
      this.symbols = event.target.checked;
  }

  // Copy password to clipboard
  @ViewChild('passwordOutput', {static: true}) password: ElementRef;
  private copyPassword() {
    const inputElement = <HTMLInputElement>this.password.nativeElement;
    inputElement.select();
    document.execCommand("copy");
  }

  // Generate password
  private generatePassword() {
    if (this.lowercase === false && this.uppercase === false && this.numbers === false && this.symbols === false) {
      return this.newPassword = "...";
    }

    // Create array from chosen checkboxes
    this.dictionary = [].concat(
      this.lowercase ? this.checkboxes[0].library.split("") : [],
      this.uppercase ? this.checkboxes[1].library.split("") : [],
      this.numbers ? this.checkboxes[2].library.split("") : [],
      this.symbols ? this.checkboxes[3].library.split("") : []
    );

    // Generate random password from array
    var newPassword = "";
    for (var i = 0; i < this.passwordLenght; i++) {
      newPassword += this.dictionary[Math.floor(Math.random() * this.dictionary.length)];
    }
    this.newPassword = newPassword;

    // Call copy function
    
  }


  ngOnInit() {

    this.rService.getRegistries().subscribe(listRegistries => {
      this.listRegistries = listRegistries;
      this.showRegistries = true;
    }, error => {
      console.error(error);
      this.showRegistries = true;
    });
    const today = new Date();
    const date = today.getDate() + "/" + today.getMonth() + "/" + today.getFullYear();
    const time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    
    document.getElementById("printDateTime").innerHTML =
      "Printed on: " + date + " at " + time;

    this.rService.currentRegistry.subscribe(selectRegistry => {
      this.openEditDetail(selectRegistry);
      this.currentRegistry = selectRegistry;
      
    })

  }
  
  errorMessage = "";
  async addUser() {

    // Recojo email y pass
    let email = this.formCreateAccount.get('email').value
    let pass = this.formCreateAccount.get('pass').value
    
    
    try {
      
      const currentUser = await this.authService.currentUser();
      console.log(this.authService.admin)
      if (this.authService.admin.includes(currentUser)) {
        throw Error('User unauthorized');
        
      }
      await this.afAuth.auth.createUserWithEmailAndPassword(email, pass)
      this.modalService.open(this.modal_success);
    } catch (error) {
      console.log(error);
      this.modalService.open(this.modal_error);
    }

   

  }
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleRepeatFieldTextType() {
    this.repeatFieldTextType = !this.repeatFieldTextType;
  }
   

  openDetail(type: string) {
    this.typeRegistry = type;
    this.showDetail = true;
  }

  openEditDetail(registry: Registry) {
    this.registrySelected = registry;
    this.showDetail = true;
  }

  closeDetail($event) {
    this.showDetail = $event;
    this.registrySelected = null;
  }

  logout(){
    this.authService.logout();
  }
loginback(){
this.route.navigate(['/login']);
  
}


}
