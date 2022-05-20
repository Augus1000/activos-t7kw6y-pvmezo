import { Router } from '@angular/router';
import { Activofijo } from '../../../models/activofijo';
import { IFilter } from './../../../interfaces/ifilter';
import { ConfigService } from './../../../services/config.service';
import { AssettypeService } from './../../../services/assettype.service';
import { Registry } from './../../../models/registry';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IActivofijo } from '../../../interfaces/iactivofijo';
import {IRegistry} from '../../../interfaces/iregistry';
import { filter, toNumber } from 'lodash-es';
import * as moment from 'moment'
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RegistryService } from '../../../services/registry.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  @Input() typeRegistry: string;
  @Input() showYears: boolean;
  @Input() showDateStartEnd: boolean;
  @Input() listOriginal: Registry[];
  public registrySelected: Registry;
  @Output() filter: EventEmitter<Registry[]>
  @Input() listRegistries: Registry[];
  public formRegistry: FormGroup;
public admin:any
public listaActivosfijos: IActivofijo[];
  public loadAssettypes: boolean;
  public filterForm: IFilter;
  public locale: any;
  public listAssettypes: IActivofijo[];
  public listFiltered: Registry[];
  public years: number[];
public filterReg:IRegistry;
public listRegistriesOriginal: IRegistry[];
  public listRegistriesFiltered: IRegistry[];
  public cargarActivosfijos: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private aService: AssettypeService,
    private config: ConfigService,
    private route: Router,
    private rService: RegistryService,
    public authService: AuthService
  ) {
    this.listaActivosfijos = [];
    this.listFiltered = [];
    this.filter = new EventEmitter<Registry[]>();
    // Inicializo con valores iniciales
    this.filterForm = {
      'idActivofijo': null,
      'dateStart': null,
      'dateEnd': null,
      'year': toNumber(moment().format("YYYY")), // Año actual
      'priceMin': null,
      'priceMax': null,

    }
    this.filterReg={
      'id': null,     
      'idActivofijo': null,
      'activofijo': null,
      'type': null,
      'date': null,
      'precio':null,
      'catastralcode': null,
      'ruat': null,
      'serialnumber': null,
      'internalcode': null,
      'depreciation': null,
      'ubication': null,
      'responsable': null,
      'licenseplate':null,
      'typeofvehicle':null,
      'marca': null,
      'color': null,
     'chassis':null,
      'model': null,
     'user': null,
      'invoice':null,
      'provider':null,
      'fiscal':null,
      'authNumber':null,
      'agencia':null,
      'nombre':null,
      'imagePost':null,
      'qrcode': null,
      'estado':null,
      
    }
   this.admin= this.authService.admin;
   
    
    this.locale = this.config.locale;
    this.years = [];
  }

  ngOnInit() {

    // Obtengo los activos
    this.aService.getActivofijo().subscribe(assettypes => {
      this.listAssettypes = assettypes;
    }, error => {
      console.error("Error al recuperar los activos fijos: " + error);
    })

    // Relleno los años
    if(this.showYears){
      this.fillYears();
    }
    

    
    
    // Obtengo los activos
    this.aService.getActivofijo().subscribe(listaActivosfijos => {
      this.listaActivosfijos= listaActivosfijos;

      this.cargarActivosfijos = true;
    }, error => {
      console.error(error);
      this.cargarActivosfijos= true;
    });
  }
 
  /**
   * Relleno los años, obtengo el año inicial y el año final de la configuracion
   */
  fillYears(){
    for (let year = this.config.yearStart; year <= this.config.yearEnd; year++) {
      this.years.push(year);

    }
  }

  /**
   * Filtra los datos
   */
  filterData(){



    const maxPrice = this.filterForm.priceMax ? toNumber(this.filterForm.priceMax) : Number.MAX_SAFE_INTEGER;
    const minPrice = this.filterForm.priceMin ? toNumber(this.filterForm.priceMin): Number.MIN_SAFE_INTEGER;
    const dateStart = this.filterForm.dateStart ? this.filterForm.dateStart : new Date(-8640000000000000);
    const dateEnd = this.filterForm.dateEnd ? this.filterForm.dateEnd : new Date(8640000000000000);
    const year = this.filterForm.year ? this.filterForm.year : Date.now();
    const branches = this.filterReg.agencia ? this.filterReg.agencia :"";
    const asset = this.filterReg.idActivofijo ? this.filterReg.idActivofijo:"";
    const estados = this.filterReg.estado ? this.filterReg.estado:"";
    const responsables = this.filterReg.responsable ? this.filterReg.responsable:"";
    if (!this.showYears) {
      this.listFiltered = this.listOriginal.filter(l => {
        return moment(l.date, 'YYYY-MM-DD').isSameOrAfter(moment(dateStart, 'YYYY-MM-DD')) &&
          moment(l.date, 'YYYY-MM-DD').isSameOrBefore(moment(dateEnd, 'YYYY-MM-DD')) &&
          toNumber(l.precio) <= maxPrice &&
          toNumber(l.precio) >= minPrice &&
          (branches === "" ? true : branches ===  l.agencia) &&
          (asset === "" ? true : asset ===  l.idActivofijo) &&
          (estados=== "" ? true : estados ===  l.estado) &&
          (responsables=== "" ? true : responsables ===  l.responsable) &&
          this.route.navigate(['/resume'])

      })
    }
    else{
      this.listFiltered = this.listOriginal.filter(l => {
        return moment(l.date, 'YYYY-MM-DD').year() === moment(year, 'YYYY-MM-DD').year() &&
          toNumber(l.precio) <= maxPrice &&
          toNumber(l.precio) >= minPrice

      })

    }
    this.filter.emit(this.listFiltered);
  }
}
