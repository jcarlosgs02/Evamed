import { NgModule, Component, OnInit, Input, ViewChildren, ViewChild, QueryList, ViewContainerRef, ComponentFactoryResolver} from '@angular/core';
import { element } from 'protractor';
import { BarChartComponent } from 'src/app/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/pie-chart/pie-chart.component';
import { RadialChartComponent } from 'src/app/radial-chart/radial-chart.component';
import { ProjectsService } from './../../../core/services/projects/projects.service';
import { MaterialsService } from './../../../core/services/materials/materials.service';
import { AnalisisService } from './../../../core/services/analisis/analisis.service';
import { forkJoin, observable } from 'rxjs';
import { couldStartTrivia } from 'typescript';
import { getAttrsForDirectiveMatching } from '@angular/compiler/src/render3/view/util';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comparar',
  templateUrl: './comparar.component.html',
  styleUrls: ['./comparar.component.scss'],
})

@NgModule({
  entryComponents: [ 
    BarChartComponent,
    RadialChartComponent,
    PieChartComponent
  ]
})
export class CompararComponent implements OnInit {
  barChartComponent = BarChartComponent;
  radialChart = RadialChartComponent;
  pieChart = PieChartComponent;

  @ViewChild('barContainer', {read: ViewContainerRef}) container: ViewContainerRef;
  @ViewChild('GraficasEspecificas', {read: ViewContainerRef}) containerGraficas: ViewContainerRef;

  @Input('Inproyectos_bar') inputproyect_bar: any;
  @Input('Inproyectos_radar') inputproyect_radar: any;
  @Input('Inproyectos_pie') inputproyect_pie: any;
  @ViewChildren(BarChartComponent)
  childBar: QueryList<BarChartComponent>;
  @ViewChildren(PieChartComponent)
  childPie: QueryList<PieChartComponent>;
  @ViewChildren(RadialChartComponent)
  childRadar: QueryList<RadialChartComponent>;
  selector: string = null;
  bandera:number;
  showVar: boolean = false;
  showVar_1: boolean = false;
  ID:string;
  proyecto:string;
  banderaGrapg:number=0;
  proyect=[];
  inputproyect_bar_porcent=[];
  proyect_active=[];
  outproyect_bar = [];
  outproyect_bar_porcent=[];
  outproyect_radar=[];
  outproyect_pie = [];
  hover:boolean=true;
  bandera_porcentaje: boolean = true;
  bandera_num:boolean= false;

  // vars analisis
  idProyectoActivo: number = 46;

  projectsList: [];
  materialList: [];
  materialSchemeDataList: [];
  materialSchemeProyectList: [];
  potentialTypesList: [];
  standarsList: [];
  CSEList: [];
  SIDList: [];
  SIList: [];
  ACRList: [];
  ECDList: [];
  TEDList: [];
  TEList: [];
  ULList: [];
  ECDPList: [];

  impactosIgnorar = ['Human toxicity','Fresh water aquatic ecotox.', 'Marine aquatic ecotoxicity', 'Terrestrial ecotoxicity']


  constructor(
    private materials: MaterialsService,
    private projects: ProjectsService,
    private analisis: AnalisisService,
    private componentFactoryResolver: ComponentFactoryResolver
    ){

    forkJoin([
      this.analisis.getTypeEnergy(),
      this.projects.getProjects(),
      this.materials.getMaterials(),
      this.analisis.getMaterialSchemeData(),
      this.analisis.getMaterialSchemeProyect(),
      this.analisis.getPotentialTypes(),
      this.analisis.getStandars(),
      this.analisis.getConstructiveSystemElement(),
      this.analisis.getSourceInformationData(),
      this.analisis.getSourceInformation(),
      this.analisis.getAnnualConsumptionRequired(),
      this.analisis.getElectricityConsumptionData(),
      this.analisis.getTypeEnergyData(),
      this.analisis.getUsefulLife(),
      this.analisis.getECDP()
    ])
    .subscribe(([
      TE,
      projectsData,
      materialData,
      materialSchemeData,
      materialSchemeProyect,
      potentialTypes,
      standards,
      CSE,
      SID,
      SI,
      ACR,
      ECD,
      TED,
      UL,
      ECDP
    ]) => {
      this.idProyectoActivo = parseInt(sessionStorage.getItem('projectID'));
      // console.log('id recibido', this.idProyectoActivo)

      this.projectsList = projectsData;
      this.materialList = materialData;
      this.materialSchemeDataList = materialSchemeData;
      this.materialSchemeProyectList = materialSchemeProyect;
      this.potentialTypesList = potentialTypes;
      this.standarsList = standards;
      this.CSEList = CSE;
      this.SIDList = SID;
      this.SIList = SI;
      this.ACRList = ACR;
      this.ECDList = ECD;
      this.TEDList = TED;
      this.TEList = TE;
      this.ULList = UL;
      this.ECDPList = ECDP;
      // console.log(this.TEList);
      this.menu_inicio();
      // this.childBar.forEach(c => c.ngOnInit());
    });

  }

  ngOnInit(): void {
    // this.proyecto="Hospital infantil Lomas Altas";
    // this.menu_inicio();
    // this.ID = 'Producción';
  }
  
  //agregar proyecto a graficas

  iniciar_graficas(id:number){
    // return;
    if (this.proyect_active.some((item) => item == id) ) {
      return;
    }
    console.log(id)
    this.proyect_active.push(id);
    this.proyect.forEach((proyecto,index) => {
      if(proyecto.id==id && proyecto.id != this.idProyectoActivo){
        this.proyect[index].card = true;
      }
    });

    let analisis = this.getAnalisisBarras(id);
    let analisisRad = this.getAnalisisRadial(id);
    let analisisPie = this.getAnalisisPie(id);
    // console.log(analisisPie)
    this.outproyect_bar.push(analisis);
    this.outproyect_radar.push(analisisRad);
    this.outproyect_pie.push(analisisPie);
    // this.childBar.forEach(c => c.agregarProyecto(this.outproyect_bar));
    this.iniciaBarras();
    
    this.showVar = false;
    this.showVar_1 = false;
    return;
    this.outproyect_bar.push(this.inputproyect_bar[id]);
    this.outproyect_radar.push(this.inputproyect_radar[id]);
    this.outproyect_pie.push(this.inputproyect_pie[id]);
    
    
  }

  iniciaBarras(){
    this.container.clear();
    // console.log(this.container):
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.barChartComponent);
    const grafica = this.container.createComponent(componentFactory);
    grafica.instance.porcentaje = this.bandera_porcentaje;
    grafica.instance.inputProyects = this.outproyect_bar;
    grafica.instance.showMe = true;
    grafica.instance.lastClickEvent.subscribe(e => this.receiveSelector(e));
  }

  iniciaRadiales(){
    this.containerGraficas.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.radialChart);
    const grafica = this.containerGraficas.createComponent(componentFactory);
    grafica.instance.inputProyect = this.outproyect_radar;
    grafica.instance.showMe = this.showVar_1;
    grafica.instance.id = this.ID;
    // grafica.instance.cargarDatos(this.ID)
        // this.childRadar.forEach(c => c.cargarDatos(this.ID));
  }
  iniciaPie(){
    this.containerGraficas.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.pieChart);
    const grafica = this.containerGraficas.createComponent(componentFactory);
    grafica.instance.inputProyect = this.outproyect_pie;
    grafica.instance.showMePartially = this.showVar;
    grafica.instance.indicador = this.selector;
    grafica.instance.id = this.ID;
    // grafica.instance.cargarDatos(this.ID)
        // this.childRadar.forEach(c => c.cargarDatos(this.ID));
  }

  getAnalisisBarras(idProyecto){
    let analisisProyectos : Record<string,any> = {
      Nombre: this.projectsList.filter( p => p['id'] == idProyecto)[0]['name_project'],
      id: idProyecto,
      Datos: {}
    };
    
    // Etapa de construccion

    let standardId = this.standarsList.filter(s => s['name_standard'] == 'A1-A3' )[0]['id'];
    let schemeProyect = this.materialSchemeProyectList.filter(msp => msp['project_id'] == idProyecto);

    schemeProyect.forEach(ps => {
      let impactos = this.materialSchemeDataList.filter(msd => msd['material_id'] == ps['material_id'] && msd['standard_id'] == standardId ) 
      // console.log(ps)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        if (!Object.keys(analisisProyectos['Datos']).includes(potencial)){
          analisisProyectos.Datos[potencial] = {};
        }
        if(!Object.keys(analisisProyectos['Datos'][potencial]).includes('Producción')){
          analisisProyectos['Datos'][potencial]['Producción'] = 0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos'][potencial]['Producción'] += impacto['value']*ps['quantity'];
      });
    });

    // TODO: falta analisis de transporte por material ( no forma de guardar datos en la base )

    // etapa de construcción
    let CSEs = this.CSEList.filter(c =>  c['project_id'] == idProyecto);
    CSEs.forEach(CSE =>{
      let impactos = this.SIDList.filter(sid => sid['sourceInformarion_id'] == CSE['source_information_id']  ) 
      // console.log(ps)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        if (!Object.keys(analisisProyectos['Datos']).includes(potencial)){
          analisisProyectos.Datos[potencial] = {};
        }
        if(!Object.keys(analisisProyectos['Datos'][potencial]).includes('Construccion')){
          analisisProyectos['Datos'][potencial]['Construccion'] = 0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos'][potencial]['Construccion'] += impacto['value'] * CSE['quantity'];
      });
    });


    // Estapa de Uso

    let listaACR = this.ACRList.filter(acr => acr['project_id'] == idProyecto)
    if (listaACR.length>0){
      let consumoID =  this.ACRList.filter(acr => acr['project_id'] == idProyecto)[0]['id'];
      let consumos = this.ECDList.filter(ecd => ecd['annual_consumption_required_id'] == consumoID );
      let vidaUtilID = this.projectsList.filter( p => p['id'] == idProyecto)[0]['useful_life_id']
      let vidaUtil:any = this.ULList.filter(ul => ul['id'] == vidaUtilID)[0]['name_useful_life'];
      try{
        vidaUtil = parseFloat(vidaUtil);
      }catch{
        vidaUtil = 1;
      }

      // console.log(vidaUtil)
      consumos.forEach(ecd => {
        let impactos = this.TEDList.filter(sid => sid['type_energy_id'] == ecd['type'] ) 
        // console.log(ps)
        impactos.forEach(impacto =>{
          let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
          if (!Object.keys(analisisProyectos['Datos']).includes(potencial)){
            analisisProyectos.Datos[potencial] = {};
          }
          if(!Object.keys(analisisProyectos['Datos'][potencial]).includes('Uso')){
            analisisProyectos['Datos'][potencial]['Uso'] = 0;
          }
          // console.log(impacto['value'],impacto['value']*ps['quantity'])
          analisisProyectos['Datos'][potencial]['Uso'] += impacto['value'] * ecd['quantity'] ;
        });
      });
    }
    // console.log(analisisProyectos)

    //Etapa de Fin de Vida
    let ECDPs = this.ECDPList.filter(c =>  c['project_id'] == idProyecto);
    ECDPs.forEach(ECDP =>{
      let impactos = this.SIDList.filter(sid => sid['sourceInformarion_id'] == ECDP['source_information_id']  ) 
      // console.log(ps)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        if (!Object.keys(analisisProyectos['Datos']).includes(potencial)){
          analisisProyectos.Datos[potencial] = {};
        }
        if(!Object.keys(analisisProyectos['Datos'][potencial]).includes('FinDeVida')){
          analisisProyectos['Datos'][potencial]['FinDeVida'] = 0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos'][potencial]['FinDeVida'] += impacto['value'] * ECDP['quantity'];
      });
    });


    //Filtro de impactos que no se tomaran en cuenta ahorita 
    // console.log(`"${Object.keys(analisisProyectos.Datos)}"`)
    this.impactosIgnorar.forEach(impacto => {
      if (Object.keys(analisisProyectos.Datos).includes(impacto)){
        delete analisisProyectos.Datos[impacto];
      }
    });

    return analisisProyectos;
  }
  
  getAnalisisRadial(idProyecto){
    let analisisProyectos : Record<string,any> = {
      Nombre: this.projectsList.filter( p => p['id'] == idProyecto)[0]['name_project'],
      id: idProyecto,
      Datos: {}
    };
    let totales : Record<string,any> = {}
    // Etapa de construccion

    let standardId = this.standarsList.filter(s => s['name_standard'] == 'A1-A3' )[0]['id'];
    let schemeProyect = this.materialSchemeProyectList.filter(msp => msp['project_id'] == idProyecto);
    // console.log(schemeProyect)
    schemeProyect.forEach(ps => {
      let impactos = this.materialSchemeDataList.filter(msd => msd['material_id'] == ps['material_id'] && msd['standard_id'] == standardId ) 
      // console.log(impactos)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        if (!Object.keys(analisisProyectos['Datos']).includes('Producción')){
          analisisProyectos.Datos['Producción'] = {};
        }
        if(!Object.keys(analisisProyectos['Datos']['Producción']).includes(potencial)){
          analisisProyectos['Datos']['Producción'][potencial] = 0;
        }
        if(!Object.keys(totales).includes(potencial)){
          totales[potencial]=0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos']['Producción'][potencial] += impacto['value']*ps['quantity'];
        totales[potencial] +=impacto['value']*ps['quantity'];
      });
    });

    // TODO: falta analisis de transporte por material ( no forma de guardar datos en la base )

    // etapa de construcción
    let CSEs = this.CSEList.filter(c =>  c['project_id'] == idProyecto);
    CSEs.forEach(CSE =>{
      let impactos = this.SIDList.filter(sid => sid['sourceInformarion_id'] == CSE['source_information_id']  ) 
      // console.log(ps)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        if (!Object.keys(analisisProyectos['Datos']).includes('Construccion')){
          analisisProyectos.Datos['Construccion'] = {};
        }
        if(!Object.keys(analisisProyectos['Datos']['Construccion']).includes(potencial)){
          analisisProyectos['Datos']['Construccion'][potencial] = 0;
        }
        if(!Object.keys(totales).includes(potencial)){
          totales[potencial]=0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos']['Construccion'][potencial] += impacto['value'] * CSE['quantity'];
        totales[potencial] += impacto['value'] * CSE['quantity'];
      });
    });


    // Estapa de Uso
    
    let listaACR = this.ACRList.filter(acr => acr['project_id'] == idProyecto)
    if (listaACR.length>0){
      let consumoID =  this.ACRList.filter(acr => acr['project_id'] == idProyecto)[0]['id'];
      let consumos = this.ECDList.filter(ecd => ecd['annual_consumption_required_id'] == consumoID );
      let vidaUtilID = this.projectsList.filter( p => p['id'] == idProyecto)[0]['useful_life_id']
      let vidaUtil:any = this.ULList.filter(ul => ul['id'] == vidaUtilID)[0]['name_useful_life'];
      try{
        vidaUtil = parseFloat(vidaUtil);
      }catch{
        vidaUtil = 1;
      }

      // console.log(vidaUtil)
      consumos.forEach(ecd => {
        let impactos = this.TEDList.filter(sid => sid['type_energy_id'] == ecd['type'] ) 
        // console.log(ps)
        impactos.forEach(impacto =>{
          let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
          if (!Object.keys(analisisProyectos['Datos']).includes('Uso')){
            analisisProyectos.Datos['Uso'] = {};
          }
          if(!Object.keys(analisisProyectos['Datos']['Uso']).includes(potencial)){
            analisisProyectos['Datos']['Uso'][potencial] = 0;
          }
          if(!Object.keys(totales).includes(potencial)){
            totales[potencial]=0;
          }
          // console.log(impacto['value'],impacto['value']*ps['quantity'])
          analisisProyectos['Datos']['Uso'][potencial] += impacto['value'] * ecd['quantity'] ;
          totales[potencial] += impacto['value'] * ecd['quantity'] ;
        });
      });
    }

    Object.keys(analisisProyectos.Datos).forEach(key1 => {
      Object.keys(analisisProyectos.Datos[key1]).forEach(key2 =>{
        analisisProyectos.Datos[key1][key2] = analisisProyectos.Datos[key1][key2] * 100/totales[key2];
      });
    });
    // console.log(analisisProyectos)



    //Analisis Fin de vida

    let ECDPs = this.ECDPList.filter(c =>  c['project_id'] == idProyecto);
    ECDPs.forEach(ECDP =>{
      let impactos = this.SIDList.filter(sid => sid['sourceInformarion_id'] == ECDP['source_information_id']  ) 
      // console.log(ps)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        if (!Object.keys(analisisProyectos['Datos']).includes('FinDeVida')){
          analisisProyectos.Datos['FinDeVida'] = {};
        }
        if(!Object.keys(analisisProyectos['Datos']['FinDeVida']).includes(potencial)){
          analisisProyectos['Datos']['FinDeVida'][potencial] = 0;
        }
        if(!Object.keys(totales).includes(potencial)){
          totales[potencial]=0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos']['FinDeVida'][potencial] += impacto['value'] * ECDP['quantity'];
        totales[potencial] += impacto['value'] * ECDP['quantity'];
      });
    });

    //Filtro de impactos que no se tomaran en cuenta ahorita 
    Object.keys(analisisProyectos.Datos).forEach(etapa =>{
      // console.log(`"${Object.keys(analisisProyectos.Datos[etapa])}"`)
      this.impactosIgnorar.forEach(impacto => {
        // console.log(`"${Object.keys(analisisProyectos.Datos[])}"`)
        if (Object.keys(analisisProyectos.Datos[etapa]).includes(impacto)){
          delete analisisProyectos.Datos[etapa][impacto];
        }
      });
    });
    
    return analisisProyectos;
  }

  getAnalisisPie(idProyecto){
    let analisisProyectos : Record<string,any> = {
      Nombre: this.projectsList.filter( p => p['id'] == idProyecto)[0]['name_project'],
      id: idProyecto,
      Datos: {}
    };
    
    // Etapa de construccion

    // let standardId = this.standarsList.filter(s => s['name_standard'] != 'A1-A3' )[0]['id'];
    let schemeProyect = this.materialSchemeProyectList.filter(msp => msp['project_id'] == idProyecto);

    schemeProyect.forEach(ps => {
      let impactos = this.materialSchemeDataList.filter(msd => msd['material_id'] == ps['material_id']  ) 
      // console.log(ps)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        
        //filtro impactos que no se tomaran en cuenta ahorita
        if (this.impactosIgnorar.includes(potencial)){
          return;
        }


        let standardName = this.standarsList.filter(s => s['id'] == impacto['standard_id'] )[0]['name_standard'];
        if(standardName == 'A1-A3'){
          return
        }
        if (!Object.keys(analisisProyectos['Datos']).includes(potencial)){
          analisisProyectos.Datos[potencial] = {};
        }
        if(!Object.keys(analisisProyectos['Datos'][potencial]).includes('Producción')){
          analisisProyectos['Datos'][potencial]['Producción'] = {};
        }
        if(!Object.keys(analisisProyectos['Datos'][potencial]['Producción']).includes(standardName)){
          analisisProyectos['Datos'][potencial]['Producción'][standardName] = 0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos'][potencial]['Producción'][standardName] += impacto['value']*ps['quantity'];
      });
    });

    // TODO: falta analisis de transporte por material ( no forma de guardar datos en la base )

    // etapa de construcción
    let CSEs = this.CSEList.filter(c =>  c['project_id'] == idProyecto);
    CSEs.forEach( CSE =>{
      let impactos = this.SIDList.filter(sid => sid['sourceInformarion_id'] == CSE['source_information_id']  ) 
      
      // console.log(ps)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        let SIName = this.SIList.filter(s => s['id'] == impacto['sourceInformarion_id'] )[0]['name_source_information'];

        //filtro impactos que no se tomaran en cuenta ahorita
        if (this.impactosIgnorar.includes(potencial)){
          return;
        }

        // console.log( SIName)
        if (!Object.keys(analisisProyectos['Datos']).includes(potencial)){
          analisisProyectos.Datos[potencial] = {};
        }
        if(!Object.keys(analisisProyectos['Datos'][potencial]).includes('Construccion')){
          analisisProyectos['Datos'][potencial]['Construccion'] = {};
        }
        
        if(!Object.keys(analisisProyectos['Datos'][potencial]['Construccion']).includes(SIName)){
          analisisProyectos['Datos'][potencial]['Construccion'][SIName] = 0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos'][potencial]['Construccion'][SIName] += impacto['value'] * CSE['quantity'];
      });
    });


    // Estapa de Uso
    let listaACR = this.ACRList.filter(acr => acr['project_id'] == idProyecto)
    if (listaACR.length>0){
      let consumoID =  this.ACRList.filter(acr => acr['project_id'] == idProyecto)[0]['id'];
      let consumos = this.ECDList.filter(ecd => ecd['annual_consumption_required_id'] == consumoID );
      let vidaUtilID = this.projectsList.filter( p => p['id'] == idProyecto)[0]['useful_life_id']
      let vidaUtil:any = this.ULList.filter(ul => ul['id'] == vidaUtilID)[0]['name_useful_life'];
      try{
        vidaUtil = parseFloat(vidaUtil);
      }catch{
        vidaUtil = 1;
      }

      // console.log(vidaUtil)
      consumos.forEach(ecd => {
        let impactos = this.TEDList.filter(sid => sid['type_energy_id'] == ecd['type'] ) 
          // console.log(ps)
        impactos.forEach(impacto =>{
          // console.log('pie',impacto['type_energy_id'])
          let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
          let procesName = this.TEList.filter(te => te['id'] == impacto['type_energy_id'])[0]['name_type_energy']
          
          //filtro impactos que no se tomaran en cuenta ahorita
          if (this.impactosIgnorar.includes(potencial)){
            return;
          }

          if (!Object.keys(analisisProyectos['Datos']).includes(potencial)){
            analisisProyectos.Datos[potencial] = {};
          }
          if(!Object.keys(analisisProyectos['Datos'][potencial]).includes('Uso')){
            analisisProyectos['Datos'][potencial]['Uso'] = {};
          }
          if(!Object.keys(analisisProyectos['Datos'][potencial]['Uso']).includes(procesName)){
            analisisProyectos['Datos'][potencial]['Uso'][procesName] = 0;
          }
          // console.log(impacto['value'],impacto['value']*ps['quantity'])
          analisisProyectos['Datos'][potencial]['Uso'][procesName] += impacto['value'] * ecd['quantity'] ;
        });
      });
    }

    //Analisis de fin de vida
    let ECDPs = this.ECDPList.filter(c =>  c['project_id'] == idProyecto);
    ECDPs.forEach( ECDP =>{
      let impactos = this.SIDList.filter(sid => sid['sourceInformarion_id'] == ECDP['source_information_id']  ) 
      
      // console.log(ps)
      impactos.forEach(impacto =>{
        let potencial = this.potentialTypesList.filter(pt => pt['id'] == impacto['potential_type_id'] )[0]['name_potential_type']
        let SIName = this.SIList.filter(s => s['id'] == impacto['sourceInformarion_id'] )[0]['name_source_information'];

        //filtro impactos que no se tomaran en cuenta ahorita
        if (this.impactosIgnorar.includes(potencial)){
          return;
        }

        // console.log( SIName)
        if (!Object.keys(analisisProyectos['Datos']).includes(potencial)){
          analisisProyectos.Datos[potencial] = {};
        }
        if(!Object.keys(analisisProyectos['Datos'][potencial]).includes('FinDeVida')){
          analisisProyectos['Datos'][potencial]['FinDeVida'] = {};
        }
        
        if(!Object.keys(analisisProyectos['Datos'][potencial]['FinDeVida']).includes(SIName)){
          analisisProyectos['Datos'][potencial]['FinDeVida'][SIName] = 0;
        }
        // console.log(impacto['value'],impacto['value']*ps['quantity'])
        analisisProyectos['Datos'][potencial]['FinDeVida'][SIName] += impacto['value'] * ECDP['quantity'];
      });
    });


    // console.log(analisisProyectos)
    return analisisProyectos;
  }


  //Se cargan los proyetcos existentes y se configura el menu
  menu_inicio(){
    this.projectsList.forEach(proyecto => {
      if (proyecto['id'] == this.idProyectoActivo){
        this.proyecto = proyecto['name_project']
        return;
      }
      this.proyect = [...this.proyect,
        {
          Nombre: proyecto['name_project'],
          id: proyecto['id'],
          card: false
        }];
    })
    this.iniciar_graficas(this.idProyectoActivo);
    // console.log('inicia radiales')
    this.iniciaRadiales();
    this.iniciaPie();

    // this.proyect_active.push(this.idProyectoActivo);
    // this.outproyect_bar.push(this.getAnalisisBarras(this.idProyectoActivo));
    // this.datosProcentaje();
    //carga de datos inicial en graficas
    // this.outproyect_bar.push(this.inputproyect_bar[0]);
    // this.outproyect_radar.push(this.inputproyect_radar[0]);
    // this.outproyect_pie.push(this.inputproyect_pie[0]);
  }

  //Poner en porcentajes los datos
  datosProcentaje(){
    this.inputproyect_bar_porcent=this.inputproyect_bar;
    this.inputproyect_bar.forEach(proyecto => {
      const auxDatos = { Producción: [], Construccion: [], Uso: [], FinDeVida: [] };
      Object.keys(proyecto.Datos).forEach(indicador => {
        Object.keys(auxDatos).forEach(etapa => {
          //proyecto.Datos[indicador][etapa] = (proyecto.Datos[indicador.toString()][etapa] * 100 / proyecto.Datos[indicador.toString()].total).toFixed(2)
          // console.log(etapa, proyecto.Datos[indicador.toString()].total);
        });
      });
    });
  }

  //activar gráfica de porcentaje
  porcentaje(val:boolean){
    if ( val == this.bandera_porcentaje ){ return; }

    this.bandera_porcentaje = val;
    this.iniciaBarras();
  }

  //quitar proyecto a las gráficas
  quitarProyecto(ID:number){
    this.proyect.forEach((proyecto, index) => {
      if (proyecto.id == ID) {
        this.proyect[index].card = false;
      }
    });
    this.proyect_active = this.proyect_active.filter(item => item != ID);
    this.outproyect_bar = this.outproyect_bar.filter(({id}) => id != ID);
    this.outproyect_radar = this.outproyect_radar.filter(({ id }) => id != ID);
    this.outproyect_pie = this.outproyect_pie.filter(({ id }) => id != ID);

    this.iniciaBarras();
    this.iniciaRadiales();
    this.iniciaPie();
  }

  receiveSelector($event) {
    //cordinate with bar graph
    this.selector = $event;
    this.showVar_1 = false;
    this.showVar = false;
    if (this.selector==null){
      this.bandera = 0;
      this.hover = true;
    }else{
      this.bandera=1;
      this.hover = false;
    }

  }

  grafica(x: string) {
    //activate graph selectioned
    if (this.banderaGrapg == 0) {
      this.banderaGrapg++;
      this.ID = ' ';
    }
    if(x===this.ID ){
      if (this.bandera == 1) {
        this.showVar = false;
      } else {
        this.showVar_1 = false;
        this.hover = true;
        this.childBar.forEach(c => c.resetColores());
      }
      this.banderaGrapg=0;
      // console.log("on");
      this.ID = x;
      this.containerGraficas.clear()
    }else{
      this.ID = x;
      if (this.bandera == 1) {
        this.showVar = true;
        this.showVar_1 =false;

        this.iniciaPie();

        this.childPie.forEach(c => c.cargarDatos(this.ID,this.selector));
      } else {
        this.showVar_1 = true;
        this.showVar=false;
        this.hover=false;
        // console.log('radiales')
        this.iniciaRadiales()

        this.childRadar.forEach(c => c.cargarDatos(this.ID));
        this.childBar.forEach(c => c.focusSeries(this.ID));
      }
    }
  }

}