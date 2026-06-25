/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Ventanas;

import static Ventanas.Modificar_Saldos.jComboBox1;
import static Ventanas.Modificar_Saldos.jComboBox2;
import static Ventanas.Modificar_Saldos.jComboBox3;
import static Ventanas.Modificar_Saldos.jTextField1;
import static Ventanas.Modificar_Saldos.jTextField2;
import static Ventanas.Modificar_Saldos.jTextField3;
import static Ventanas.Modificar_Saldos.jTextField5;
import static Ventanas.Modificar_Saldos.jTextField8;
import static Ventanas.Modificar_Saldos.jTextField9;
import com.placeholder.PlaceHolder;
import com.sun.glass.events.KeyEvent;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JLabel;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableModel;
import javax.swing.table.TableRowSorter;

/**
 *
 * @author tesoreria
 */
public class Padron_de_Empleados extends javax.swing.JFrame {
    
    //CONEXION A LA BASE DE DATOS
    Conectar cc= new Conectar();
    Connection cn= cc.conexion();

    /**
     * Creates new form Padron_de_Empleados
     */
    public Padron_de_Empleados() {
        initComponents();        
        this.setLocationRelativeTo(this);  //CENTRAR VENTANA
        jTextField1.setVisible(false);  //PARA QUE SEA INVISIBLE EL JTEXTFIELD
        MostrarTablaempleados_Todos();  //MUESTRA Todos los Empleados
        ((JLabel)jComboBox1.getRenderer()).setHorizontalAlignment(SwingConstants.CENTER); //CENTRAR TEXTO DEL JCOMBOBOX1
        ((JLabel)jComboBox2.getRenderer()).setHorizontalAlignment(SwingConstants.CENTER); //CENTRAR TEXTO DEL JCOMBOBOX2
        ((JLabel)jComboBox3.getRenderer()).setHorizontalAlignment(SwingConstants.CENTER); //CENTRAR TEXTO DEL JCOMBOBOX3
    }
    
    void MostrarTablaempleados_Todos(){
        DefaultTableModel modelo = new DefaultTableModel();
        //PODER ORDENAR DE MAYOR A MENOR O VICEVERSA
        TableRowSorter<TableModel> elQueOrdena = new TableRowSorter<>(modelo);
        jTableBD.setRowSorter(elQueOrdena);
        //FIN
        modelo.addColumn("COD");
        modelo.addColumn("LEG");
        modelo.addColumn("DNI");
        modelo.addColumn("APELLIDO");
        modelo.addColumn("NOMBRE");
        modelo.addColumn("CATEGORIA");
        modelo.addColumn("CUIL");
        modelo.addColumn("FECHA INGRESO");
        modelo.addColumn("ACTIVO");
        jTableBD.setModel(modelo);
        //PONER TAMAÑO DE LAS COLUMNAS
        jTableBD.getColumn("COD").setPreferredWidth(1);
        jTableBD.getColumn("LEG").setPreferredWidth(50);
        jTableBD.getColumn("DNI").setPreferredWidth(70);
        jTableBD.getColumn("APELLIDO").setPreferredWidth(80);
        jTableBD.getColumn("NOMBRE").setPreferredWidth(160);
        jTableBD.getColumn("CATEGORIA").setPreferredWidth(180);
        jTableBD.getColumn("CUIL").setPreferredWidth(90);
        jTableBD.getColumn("FECHA INGRESO").setPreferredWidth(90);
        jTableBD.getColumn("ACTIVO").setPreferredWidth(50);
        
        String sql = "SELECT * FROM empleados";
        
        String datos[] = new String [9];                        
        Statement st;
        
        try{
            st= cn.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()){
                datos[0]=rs.getString(1);
                datos[1]=rs.getString(2);
                datos[2]=rs.getString(3);
                datos[3]=rs.getString(4);
                datos[4]=rs.getString(5);
                datos[5]=rs.getString(6);
                datos[6]=rs.getString(7);
                datos[7]=rs.getString(8);
                datos[8]=rs.getString(9);
                modelo.addRow(datos);
                }
            jTableBD.setModel(modelo);
            }catch (SQLException ex){
                Logger.getLogger(Padron_de_Empleados.class.getName()).log(Level.SEVERE, null, ex);
                }
    }
    
    void MostrarTablaempleados_Activos(){
        DefaultTableModel modelo = new DefaultTableModel();
        //PODER ORDENAR DE MAYOR A MENOR O VICEVERSA
        TableRowSorter<TableModel> elQueOrdena = new TableRowSorter<>(modelo);
        jTableBD.setRowSorter(elQueOrdena);
        //FIN
        modelo.addColumn("COD");
        modelo.addColumn("LEG");
        modelo.addColumn("DNI");
        modelo.addColumn("APELLIDO");
        modelo.addColumn("NOMBRE");
        modelo.addColumn("CATEGORIA");
        modelo.addColumn("CUIL");
        modelo.addColumn("FECHA INGRESO");
        modelo.addColumn("ACTIVO");
        jTableBD.setModel(modelo);
        
        //PONER TAMAÑO DE LAS COLUMNAS
        jTableBD.getColumn("COD").setPreferredWidth(1);
        jTableBD.getColumn("LEG").setPreferredWidth(50);
        jTableBD.getColumn("DNI").setPreferredWidth(70);
        jTableBD.getColumn("APELLIDO").setPreferredWidth(80);
        jTableBD.getColumn("NOMBRE").setPreferredWidth(160);
        jTableBD.getColumn("CATEGORIA").setPreferredWidth(180);
        jTableBD.getColumn("CUIL").setPreferredWidth(90);
        jTableBD.getColumn("FECHA INGRESO").setPreferredWidth(90);
        jTableBD.getColumn("ACTIVO").setPreferredWidth(50);
        
        String sql = "SELECT * FROM `empleados` WHERE `Activo` LIKE '%S%'";
        
        String datos[] = new String [9];                        
        Statement st;
        
        try{
            st= cn.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()){
                datos[0]=rs.getString(1);
                datos[1]=rs.getString(2);
                datos[2]=rs.getString(3);
                datos[3]=rs.getString(4);
                datos[4]=rs.getString(5);
                datos[5]=rs.getString(6);
                datos[6]=rs.getString(7);
                datos[7]=rs.getString(8);
                datos[8]=rs.getString(9);
                modelo.addRow(datos);
                }
            jTableBD.setModel(modelo);
            }catch (SQLException ex){
                Logger.getLogger(Padron_de_Empleados.class.getName()).log(Level.SEVERE, null, ex);
                }
    }
        
    void MostrarTablaempleados_Bajas(){
        DefaultTableModel modelo = new DefaultTableModel();
        //PODER ORDENAR DE MAYOR A MENOR O VICEVERSA
        TableRowSorter<TableModel> elQueOrdena = new TableRowSorter<>(modelo);
        jTableBD.setRowSorter(elQueOrdena);
        //FIN
        modelo.addColumn("COD");
        modelo.addColumn("LEG");
        modelo.addColumn("DNI");
        modelo.addColumn("APELLIDO");
        modelo.addColumn("NOMBRE");
        modelo.addColumn("CATEGORIA");
        modelo.addColumn("CUIL");
        modelo.addColumn("FECHA INGRESO");
        modelo.addColumn("ACTIVO");
        jTableBD.setModel(modelo);
        
        //PONER TAMAÑO DE LAS COLUMNAS
        jTableBD.getColumn("COD").setPreferredWidth(1);
        jTableBD.getColumn("LEG").setPreferredWidth(50);
        jTableBD.getColumn("DNI").setPreferredWidth(70);
        jTableBD.getColumn("APELLIDO").setPreferredWidth(80);
        jTableBD.getColumn("NOMBRE").setPreferredWidth(160);
        jTableBD.getColumn("CATEGORIA").setPreferredWidth(180);
        jTableBD.getColumn("CUIL").setPreferredWidth(90);
        jTableBD.getColumn("FECHA INGRESO").setPreferredWidth(90);
        jTableBD.getColumn("ACTIVO").setPreferredWidth(50);
        
        String sql = "SELECT * FROM `empleados` WHERE `Activo` LIKE '%N%'";
        
        String datos[] = new String [9];                        
        Statement st;
        
        try{
            st= cn.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()){
                datos[0]=rs.getString(1);
                datos[1]=rs.getString(2);
                datos[2]=rs.getString(3);
                datos[3]=rs.getString(4);
                datos[4]=rs.getString(5);
                datos[5]=rs.getString(6);
                datos[6]=rs.getString(7);
                datos[7]=rs.getString(8);
                datos[8]=rs.getString(9);
                modelo.addRow(datos);
                }
            jTableBD.setModel(modelo);
            }catch (SQLException ex){
                Logger.getLogger(Padron_de_Empleados.class.getName()).log(Level.SEVERE, null, ex);
                }
    }
    
    void MostrarTablaempleados_Filtro(String DATOS){
        DefaultTableModel modelo = new DefaultTableModel();
        //PODER ORDENAR DE MAYOR A MENOR O VICEVERSA
        TableRowSorter<TableModel> elQueOrdena = new TableRowSorter<>(modelo);
        jTableBD.setRowSorter(elQueOrdena);
        //FIN
        modelo.addColumn("COD");
        modelo.addColumn("LEG");
        modelo.addColumn("DNI");
        modelo.addColumn("APELLIDO");
        modelo.addColumn("NOMBRE");
        modelo.addColumn("CATEGORIA");
        modelo.addColumn("CUIL");
        modelo.addColumn("FECHA INGRESO");
        modelo.addColumn("ACTIVO");
        jTableBD.setModel(modelo);
        
        //PONER TAMAÑO DE LAS COLUMNAS
        jTableBD.getColumn("COD").setPreferredWidth(1);
        jTableBD.getColumn("LEG").setPreferredWidth(50);
        jTableBD.getColumn("DNI").setPreferredWidth(70);
        jTableBD.getColumn("APELLIDO").setPreferredWidth(80);
        jTableBD.getColumn("NOMBRE").setPreferredWidth(160);
        jTableBD.getColumn("CATEGORIA").setPreferredWidth(180);
        jTableBD.getColumn("CUIL").setPreferredWidth(90);
        jTableBD.getColumn("FECHA INGRESO").setPreferredWidth(90);
        jTableBD.getColumn("ACTIVO").setPreferredWidth(50);
        
        String sql = "SELECT * FROM `empleados` WHERE `Leg` LIKE '%"+DATOS+"%' OR `Dni` LIKE '%"+DATOS+"%' OR `Apellido` LIKE '%"+DATOS+"%'";
        
        String datos[] = new String [9];                        
        Statement st;
        
        try{
            st= cn.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()){
                datos[0]=rs.getString(1);
                datos[1]=rs.getString(2);
                datos[2]=rs.getString(3);
                datos[3]=rs.getString(4);
                datos[4]=rs.getString(5);
                datos[5]=rs.getString(6);
                datos[6]=rs.getString(7);
                datos[7]=rs.getString(8);
                datos[8]=rs.getString(9);
                modelo.addRow(datos);
                }
            jTableBD.setModel(modelo);
            }catch (SQLException ex){
                Logger.getLogger(Padron_de_Empleados.class.getName()).log(Level.SEVERE, null, ex);
                }
    }
    
    void HabilitarBotones(){
        //DESHABILITAR TODOS LOS BOTONES
        if (jTextField3.getText().isEmpty() || jTextField4.getText().isEmpty() || jTextField5.getText().isEmpty() || jTextField6.getText().isEmpty() || jTextField7.getText().isEmpty() || jTextField8.getText().isEmpty()){
            jButton3.setEnabled(false);
            jButton4.setEnabled(false);
        } else {
            if (!jTextField3.getText().isEmpty() && !jTextField4.getText().isEmpty() && !jTextField5.getText().isEmpty() && !jTextField6.getText().isEmpty() && !jTextField7.getText().isEmpty() && !jTextField8.getText().isEmpty()){
                if (jTextField2.getText().isEmpty()){
                    jButton3.setEnabled(false);
                    jButton4.setEnabled(true);
                }
                if (!jTextField2.getText().isEmpty()){
                    jButton3.setEnabled(true);
                    jButton4.setEnabled(false);
                }
            }
        }
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        jPopupMenu1 = new javax.swing.JPopupMenu();
        jMenuItem1 = new javax.swing.JMenuItem();
        jTabbedPane1 = new javax.swing.JTabbedPane();
        jPanel1 = new javax.swing.JPanel();
        jLabel3 = new javax.swing.JLabel();
        jComboBox1 = new javax.swing.JComboBox<>();
        jScrollPane1 = new javax.swing.JScrollPane();
        jTableBD = new javax.swing.JTable();
        jButton2 = new javax.swing.JButton();
        jTextField1 = new javax.swing.JTextField();
        jPanel2 = new javax.swing.JPanel();
        jButton3 = new javax.swing.JButton();
        jButton4 = new javax.swing.JButton();
        jTextField2 = new javax.swing.JTextField();
        jTextField3 = new javax.swing.JTextField();
        jTextField4 = new javax.swing.JTextField();
        jLabel4 = new javax.swing.JLabel();
        jLabel5 = new javax.swing.JLabel();
        jLabel6 = new javax.swing.JLabel();
        jTextField5 = new javax.swing.JTextField();
        jTextField6 = new javax.swing.JTextField();
        jLabel7 = new javax.swing.JLabel();
        jLabel8 = new javax.swing.JLabel();
        jComboBox2 = new javax.swing.JComboBox<>();
        jLabel9 = new javax.swing.JLabel();
        jTextField7 = new javax.swing.JTextField();
        jTextField8 = new javax.swing.JTextField();
        jTextField9 = new javax.swing.JTextField();
        jLabel10 = new javax.swing.JLabel();
        jLabel11 = new javax.swing.JLabel();
        jComboBox3 = new javax.swing.JComboBox<>();
        jLabel12 = new javax.swing.JLabel();
        jFormattedTextField1 = new javax.swing.JFormattedTextField();
        jLabel2 = new javax.swing.JLabel();
        jLabel1 = new javax.swing.JLabel();
        jButton1 = new javax.swing.JButton();

        jMenuItem1.setText("MODIFICAR");
        jMenuItem1.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jMenuItem1ActionPerformed(evt);
            }
        });
        jPopupMenu1.add(jMenuItem1);

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setMaximumSize(new java.awt.Dimension(800, 500));
        setMinimumSize(new java.awt.Dimension(800, 500));
        addMouseMotionListener(new java.awt.event.MouseMotionAdapter() {
            public void mouseMoved(java.awt.event.MouseEvent evt) {
                formMouseMoved(evt);
            }
        });

        jTabbedPane1.setMaximumSize(new java.awt.Dimension(800, 415));
        jTabbedPane1.setMinimumSize(new java.awt.Dimension(800, 415));
        jTabbedPane1.setPreferredSize(new java.awt.Dimension(800, 415));
        jTabbedPane1.addMouseMotionListener(new java.awt.event.MouseMotionAdapter() {
            public void mouseMoved(java.awt.event.MouseEvent evt) {
                jTabbedPane1MouseMoved(evt);
            }
        });

        jLabel3.setFont(new java.awt.Font("Tahoma", 0, 18)); // NOI18N
        jLabel3.setText("Filtro:");
        jLabel3.setMaximumSize(new java.awt.Dimension(34, 30));
        jLabel3.setMinimumSize(new java.awt.Dimension(34, 30));
        jLabel3.setPreferredSize(new java.awt.Dimension(34, 30));

        jComboBox1.setModel(new javax.swing.DefaultComboBoxModel<>(new String[] { "Todos", "Activos", "Bajas" }));
        jComboBox1.setMaximumSize(new java.awt.Dimension(60, 30));
        jComboBox1.setMinimumSize(new java.awt.Dimension(60, 30));
        jComboBox1.setName(""); // NOI18N
        jComboBox1.setPreferredSize(new java.awt.Dimension(60, 30));
        jComboBox1.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jComboBox1ActionPerformed(evt);
            }
        });

        jTableBD.setModel(new javax.swing.table.DefaultTableModel(
            new Object [][] {
                {null, null, null, null},
                {null, null, null, null},
                {null, null, null, null},
                {null, null, null, null}
            },
            new String [] {
                "Title 1", "Title 2", "Title 3", "Title 4"
            }
        ));
        jTableBD.setComponentPopupMenu(jPopupMenu1);
        jScrollPane1.setViewportView(jTableBD);

        jButton2.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Imagenes/boton_buscar_30x30.png"))); // NOI18N
        jButton2.setToolTipText("BUSCAR POR LEG, DNI O APELLIDO");
        jButton2.setMaximumSize(new java.awt.Dimension(30, 30));
        jButton2.setMinimumSize(new java.awt.Dimension(30, 30));
        jButton2.setPreferredSize(new java.awt.Dimension(30, 30));
        jButton2.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton2ActionPerformed(evt);
            }
        });

        jTextField1.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField1.setMaximumSize(new java.awt.Dimension(220, 30));
        jTextField1.setMinimumSize(new java.awt.Dimension(220, 30));
        jTextField1.setPreferredSize(new java.awt.Dimension(220, 30));
        jTextField1.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyReleased(java.awt.event.KeyEvent evt) {
                jTextField1KeyReleased(evt);
            }
            public void keyTyped(java.awt.event.KeyEvent evt) {
                jTextField1KeyTyped(evt);
            }
        });

        javax.swing.GroupLayout jPanel1Layout = new javax.swing.GroupLayout(jPanel1);
        jPanel1.setLayout(jPanel1Layout);
        jPanel1Layout.setHorizontalGroup(
            jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel1Layout.createSequentialGroup()
                .addContainerGap()
                .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, jPanel1Layout.createSequentialGroup()
                        .addComponent(jButton2, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(28, 28, 28)
                        .addComponent(jTextField1, javax.swing.GroupLayout.PREFERRED_SIZE, 220, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                        .addComponent(jLabel3, javax.swing.GroupLayout.PREFERRED_SIZE, 49, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addComponent(jComboBox1, javax.swing.GroupLayout.PREFERRED_SIZE, 144, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(160, 160, 160))
                    .addGroup(jPanel1Layout.createSequentialGroup()
                        .addComponent(jScrollPane1)
                        .addContainerGap())))
        );
        jPanel1Layout.setVerticalGroup(
            jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel1Layout.createSequentialGroup()
                .addGap(15, 15, 15)
                .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                        .addComponent(jTextField1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                        .addComponent(jButton2, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                        .addComponent(jLabel3, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
                    .addComponent(jComboBox1, javax.swing.GroupLayout.Alignment.TRAILING, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(27, 27, 27)
                .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 274, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(41, 41, 41))
        );

        jTabbedPane1.addTab("Examinar", jPanel1);

        jButton3.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Imagenes/nuevo_usuario_80x80.png"))); // NOI18N
        jButton3.setToolTipText("MODIFICAR EMPLEADO");
        jButton3.setEnabled(false);
        jButton3.setMaximumSize(new java.awt.Dimension(80, 80));
        jButton3.setMinimumSize(new java.awt.Dimension(80, 80));
        jButton3.setPreferredSize(new java.awt.Dimension(80, 80));
        jButton3.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton3ActionPerformed(evt);
            }
        });

        jButton4.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Imagenes/modificar_usuario_80x80.png"))); // NOI18N
        jButton4.setToolTipText("NUEVO EMPLEADO");
        jButton4.setEnabled(false);
        jButton4.setMaximumSize(new java.awt.Dimension(80, 80));
        jButton4.setMinimumSize(new java.awt.Dimension(80, 80));
        jButton4.setPreferredSize(new java.awt.Dimension(80, 80));
        jButton4.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton4ActionPerformed(evt);
            }
        });

        jTextField2.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField2.setEnabled(false);
        jTextField2.setMaximumSize(new java.awt.Dimension(300, 30));
        jTextField2.setMinimumSize(new java.awt.Dimension(300, 30));
        jTextField2.setPreferredSize(new java.awt.Dimension(300, 30));

        jTextField3.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField3.setMaximumSize(new java.awt.Dimension(300, 30));
        jTextField3.setMinimumSize(new java.awt.Dimension(300, 30));
        jTextField3.setPreferredSize(new java.awt.Dimension(300, 30));
        jTextField3.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jTextField3ActionPerformed(evt);
            }
        });
        jTextField3.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyTyped(java.awt.event.KeyEvent evt) {
                jTextField3KeyTyped(evt);
            }
        });

        jTextField4.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField4.setMaximumSize(new java.awt.Dimension(300, 30));
        jTextField4.setMinimumSize(new java.awt.Dimension(300, 30));
        jTextField4.setName(""); // NOI18N
        jTextField4.setPreferredSize(new java.awt.Dimension(300, 30));
        jTextField4.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyReleased(java.awt.event.KeyEvent evt) {
                jTextField4KeyReleased(evt);
            }
            public void keyTyped(java.awt.event.KeyEvent evt) {
                jTextField4KeyTyped(evt);
            }
        });

        jLabel4.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel4.setText("Codigo:");

        jLabel5.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel5.setText("Legajo:");

        jLabel6.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel6.setText("D.N.I:");

        jTextField5.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField5.setMaximumSize(new java.awt.Dimension(300, 30));
        jTextField5.setMinimumSize(new java.awt.Dimension(300, 30));
        jTextField5.setPreferredSize(new java.awt.Dimension(300, 30));
        jTextField5.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyTyped(java.awt.event.KeyEvent evt) {
                jTextField5KeyTyped(evt);
            }
        });

        jTextField6.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField6.setMaximumSize(new java.awt.Dimension(300, 30));
        jTextField6.setMinimumSize(new java.awt.Dimension(300, 30));
        jTextField6.setPreferredSize(new java.awt.Dimension(300, 30));
        jTextField6.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyTyped(java.awt.event.KeyEvent evt) {
                jTextField6KeyTyped(evt);
            }
        });

        jLabel7.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel7.setText("Apellido: ");

        jLabel8.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel8.setText("Nombre:");

        jComboBox2.setModel(new javax.swing.DefaultComboBoxModel<>(new String[] { "APRENDIZ", "APRENDIZ (TALLER)", "AUXILIAR DE CUARTA", "AUXILIAR DE PRIMERA", "AUXILIAR DE SEGUNDA", "AUXILIAR DE TERCERA", "COND. C/CORTE CHOFER", "ENCARGADO DE TALLER", "ENCARGADO DE TRAFICO", "GOMERO", "GOMERO LAVADOR", "GUARDA", "INSPECTOR DE PRIMERA", "INSPECTOR DE SEGUNDA", "JEFE DE PERSONAL", "LAVADOR", "MAESTRANZA", "MANIOBRISTA", "MEDIO OFICIAL CHAPISTA", "MEDIO OFICIAL ELECTRICISTA", "MEDIO OFICIAL MECANICO", "OFICIAL CHAPISTA", "OFICIAL DE PRIMERA", "OFICIAL MECANICO", "PERSONAL DE MAESTRANZA", "SERENO" }));
        jComboBox2.setMaximumSize(new java.awt.Dimension(300, 30));
        jComboBox2.setMinimumSize(new java.awt.Dimension(300, 30));
        jComboBox2.setPreferredSize(new java.awt.Dimension(300, 30));

        jLabel9.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel9.setText("Categoria:");

        jTextField7.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField7.setMaximumSize(new java.awt.Dimension(50, 30));
        jTextField7.setMinimumSize(new java.awt.Dimension(50, 30));
        jTextField7.setPreferredSize(new java.awt.Dimension(50, 30));
        jTextField7.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyTyped(java.awt.event.KeyEvent evt) {
                jTextField7KeyTyped(evt);
            }
        });

        jTextField8.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField8.setMaximumSize(new java.awt.Dimension(34, 30));
        jTextField8.setMinimumSize(new java.awt.Dimension(34, 30));
        jTextField8.setPreferredSize(new java.awt.Dimension(34, 30));
        jTextField8.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyTyped(java.awt.event.KeyEvent evt) {
                jTextField8KeyTyped(evt);
            }
        });

        jTextField9.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jTextField9.setEnabled(false);
        jTextField9.setMaximumSize(new java.awt.Dimension(184, 30));
        jTextField9.setMinimumSize(new java.awt.Dimension(184, 30));
        jTextField9.setPreferredSize(new java.awt.Dimension(184, 30));

        jLabel10.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel10.setText("C.U.I.L.:");

        jLabel11.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel11.setText("Fecha de Ingreso:");

        jComboBox3.setModel(new javax.swing.DefaultComboBoxModel<>(new String[] { "S", "N" }));
        jComboBox3.setMaximumSize(new java.awt.Dimension(300, 30));
        jComboBox3.setMinimumSize(new java.awt.Dimension(300, 30));
        jComboBox3.setPreferredSize(new java.awt.Dimension(300, 30));

        jLabel12.setFont(new java.awt.Font("Tahoma", 0, 14)); // NOI18N
        jLabel12.setText("Activo:");

        try {
            jFormattedTextField1.setFormatterFactory(new javax.swing.text.DefaultFormatterFactory(new javax.swing.text.MaskFormatter("##/##/####")));
        } catch (java.text.ParseException ex) {
            ex.printStackTrace();
        }
        jFormattedTextField1.setHorizontalAlignment(javax.swing.JTextField.CENTER);
        jFormattedTextField1.setMaximumSize(new java.awt.Dimension(300, 30));
        jFormattedTextField1.setMinimumSize(new java.awt.Dimension(300, 30));
        jFormattedTextField1.setPreferredSize(new java.awt.Dimension(300, 30));

        javax.swing.GroupLayout jPanel2Layout = new javax.swing.GroupLayout(jPanel2);
        jPanel2.setLayout(jPanel2Layout);
        jPanel2Layout.setHorizontalGroup(
            jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel2Layout.createSequentialGroup()
                .addGap(85, 85, 85)
                .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING, false)
                    .addGroup(jPanel2Layout.createSequentialGroup()
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addComponent(jLabel7)
                            .addComponent(jLabel8)
                            .addComponent(jLabel9)
                            .addComponent(jLabel10)
                            .addComponent(jLabel11)
                            .addComponent(jLabel12))
                        .addGap(51, 51, 51)
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                                .addComponent(jComboBox3, javax.swing.GroupLayout.PREFERRED_SIZE, 276, javax.swing.GroupLayout.PREFERRED_SIZE)
                                .addComponent(jFormattedTextField1, javax.swing.GroupLayout.PREFERRED_SIZE, 276, javax.swing.GroupLayout.PREFERRED_SIZE))
                            .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                                .addGroup(jPanel2Layout.createSequentialGroup()
                                    .addComponent(jTextField7, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                                    .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                                    .addComponent(jTextField9, javax.swing.GroupLayout.PREFERRED_SIZE, 180, javax.swing.GroupLayout.PREFERRED_SIZE)
                                    .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                                    .addComponent(jTextField8, javax.swing.GroupLayout.PREFERRED_SIZE, 34, javax.swing.GroupLayout.PREFERRED_SIZE))
                                .addComponent(jTextField6, javax.swing.GroupLayout.PREFERRED_SIZE, 1, Short.MAX_VALUE)
                                .addComponent(jComboBox2, javax.swing.GroupLayout.PREFERRED_SIZE, 276, javax.swing.GroupLayout.PREFERRED_SIZE)
                                .addComponent(jTextField5, javax.swing.GroupLayout.PREFERRED_SIZE, 1, Short.MAX_VALUE))))
                    .addGroup(jPanel2Layout.createSequentialGroup()
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                            .addComponent(jLabel6, javax.swing.GroupLayout.Alignment.LEADING)
                            .addComponent(jLabel5, javax.swing.GroupLayout.Alignment.LEADING))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(jTextField4, javax.swing.GroupLayout.PREFERRED_SIZE, 276, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jTextField3, javax.swing.GroupLayout.PREFERRED_SIZE, 1, Short.MAX_VALUE)))
                    .addGroup(jPanel2Layout.createSequentialGroup()
                        .addComponent(jLabel4)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                        .addComponent(jTextField2, javax.swing.GroupLayout.PREFERRED_SIZE, 276, javax.swing.GroupLayout.PREFERRED_SIZE)))
                .addGap(72, 72, 72)
                .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                    .addComponent(jButton3, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jButton4, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );
        jPanel2Layout.setVerticalGroup(
            jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, jPanel2Layout.createSequentialGroup()
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jTextField2, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel4))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING, false)
                    .addGroup(jPanel2Layout.createSequentialGroup()
                        .addComponent(jButton3, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                        .addComponent(jButton4, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                    .addGroup(jPanel2Layout.createSequentialGroup()
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jTextField3, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jLabel5))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jTextField4, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jLabel6))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jTextField5, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jLabel7))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jTextField6, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jLabel8))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jComboBox2, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jLabel9))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                        .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jTextField7, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jTextField9, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jLabel10)
                            .addComponent(jTextField8, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabel11, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jFormattedTextField1, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jComboBox3, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel12))
                .addGap(23, 23, 23))
        );

        jTextField3.getAccessibleContext().setAccessibleDescription("");

        jTabbedPane1.addTab("Agregar o Modificar", jPanel2);

        jLabel2.setFont(new java.awt.Font("Tahoma", 1, 36)); // NOI18N
        jLabel2.setHorizontalAlignment(javax.swing.SwingConstants.LEFT);
        jLabel2.setText("EMPLEADOS");
        jLabel2.setMaximumSize(new java.awt.Dimension(700, 60));
        jLabel2.setMinimumSize(new java.awt.Dimension(700, 60));
        jLabel2.setPreferredSize(new java.awt.Dimension(700, 60));

        jLabel1.setFont(new java.awt.Font("Tahoma", 0, 36)); // NOI18N
        jLabel1.setHorizontalAlignment(javax.swing.SwingConstants.TRAILING);
        jLabel1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Imagenes/franja azul.png"))); // NOI18N
        jLabel1.setMaximumSize(new java.awt.Dimension(600, 60));
        jLabel1.setMinimumSize(new java.awt.Dimension(600, 60));
        jLabel1.setPreferredSize(new java.awt.Dimension(600, 60));

        jButton1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Imagenes/boton_volver_50x50.png"))); // NOI18N
        jButton1.setToolTipText("VOLVER AL MENU PRINCIPAL");
        jButton1.setMaximumSize(new java.awt.Dimension(60, 60));
        jButton1.setMinimumSize(new java.awt.Dimension(60, 60));
        jButton1.setPreferredSize(new java.awt.Dimension(60, 60));
        jButton1.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton1ActionPerformed(evt);
            }
        });

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addComponent(jLabel1, javax.swing.GroupLayout.DEFAULT_SIZE, 646, Short.MAX_VALUE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jButton1, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
            .addComponent(jTabbedPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 0, Short.MAX_VALUE)
            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
                    .addContainerGap(152, Short.MAX_VALUE)
                    .addComponent(jLabel2, javax.swing.GroupLayout.PREFERRED_SIZE, 484, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addGap(74, 74, 74)))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                    .addComponent(jButton1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .addComponent(jLabel1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jTabbedPane1, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(19, Short.MAX_VALUE))
            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                .addGroup(layout.createSequentialGroup()
                    .addComponent(jLabel2, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addGap(0, 440, Short.MAX_VALUE)))
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void jButton1ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton1ActionPerformed
        // TODO add your handling code here:
        Interfaz interfaz = new Interfaz();
        interfaz.setVisible(true);
        this.setVisible(false);
    }//GEN-LAST:event_jButton1ActionPerformed

    private void jComboBox1ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jComboBox1ActionPerformed
        // TODO add your handling code here:
        if (((String) jComboBox1.getSelectedItem()).equals("Bajas")){
        MostrarTablaempleados_Bajas();
        }
        if (((String) jComboBox1.getSelectedItem()).equals("Todos")){
        MostrarTablaempleados_Todos();
        }
        if (((String) jComboBox1.getSelectedItem()).equals("Activos")){
        MostrarTablaempleados_Activos();
        }
    }//GEN-LAST:event_jComboBox1ActionPerformed

    private void jButton2ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton2ActionPerformed
        // TODO add your handling code here:
        if (jTextField1.isVisible() == false){
            jTextField1.setVisible(true);
        } else{
            jTextField1.setVisible(false);
            jTextField1.setText("");
            MostrarTablaempleados_Todos();
        }
    }//GEN-LAST:event_jButton2ActionPerformed

    private void jTextField1KeyReleased(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField1KeyReleased
        // TODO add your handling code here:
        MostrarTablaempleados_Filtro(jTextField1.getText());
    }//GEN-LAST:event_jTextField1KeyReleased

    private void jTextField1KeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField1KeyTyped
        // TODO add your handling code here:
        //Permitir solo el ingreso de números y letras
        char car = evt.getKeyChar();
        if((car<'0' || car>'9') && (car<'a' || car>'z') && (car<'A' || car>'Z')) evt.consume();
        
        //CONVIERTE TODO EL TEXTO EN MAYUSCULA
        char c=evt.getKeyChar();
        if (Character.isLowerCase(c)){
            String cad=(""+c).toUpperCase();
            c=cad.charAt(0);
            evt.setKeyChar(c);
        }
    }//GEN-LAST:event_jTextField1KeyTyped

    private void jTextField3KeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField3KeyTyped
        // TODO add your handling code here:
        //PARA HABILITAR BOTONES POR CADA ACCION
        HabilitarBotones();
        //PERMITE EL INGRESO UNICAMENTE DE 3 DIGITOS
        if (jTextField3.getText().length()== 4){
            evt.consume();
        } 
        //Permitir solo el ingreso de NUMEROS
        char car = evt.getKeyChar();
        if(car<'0' || car>'9') evt.consume();
    }//GEN-LAST:event_jTextField3KeyTyped

    private void jTextField4KeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField4KeyTyped
        // TODO add your handling code here:
        //PARA HABILITAR BOTONES POR CADA ACCION
        HabilitarBotones();
        //PERMITE EL INGRESO UNICAMENTE DE 8 DIGITOS
        if (jTextField4.getText().length()== 8){
            evt.consume();
        } 
        //Permitir solo el ingreso de NUMEROS
        char car = evt.getKeyChar();
        if(car<'0' || car>'9') evt.consume();
    }//GEN-LAST:event_jTextField4KeyTyped

    private void jTextField5KeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField5KeyTyped
        // TODO add your handling code here:
        //Permitir solo el ingreso de LETRAS Y ESPACIOS
        char car = evt.getKeyChar();
        if((car<'a' || car>'z') && (car<'A' || car>'Z') && (car != KeyEvent.VK_SPACE)) evt.consume();
        
        //CONVIERTE TODO EL TEXTO EN MAYUSCULA
        char c=evt.getKeyChar();
        if (Character.isLowerCase(c)){
            String cad=(""+c).toUpperCase();
            c=cad.charAt(0);
            evt.setKeyChar(c);
        }
    }//GEN-LAST:event_jTextField5KeyTyped

    private void jTextField6KeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField6KeyTyped
        // TODO add your handling code here:
        //Permitir solo el ingreso de LETRAS Y ESPACIOS
        char car = evt.getKeyChar();
        if((car<'a' || car>'z') && (car<'A' || car>'Z') && (car != KeyEvent.VK_SPACE)) evt.consume();
        
        //CONVIERTE TODO EL TEXTO EN MAYUSCULA
        char c=evt.getKeyChar();
        if (Character.isLowerCase(c)){
            String cad=(""+c).toUpperCase();
            c=cad.charAt(0);
            evt.setKeyChar(c);
        }
    }//GEN-LAST:event_jTextField6KeyTyped

    private void jTextField4KeyReleased(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField4KeyReleased
        // TODO add your handling code here:
        //COPIAR LO QUE SE ESCRIBE EN jTextField9
        jTextField9.setText(jTextField4.getText());
    }//GEN-LAST:event_jTextField4KeyReleased

    private void jTextField7KeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField7KeyTyped
        // TODO add your handling code here:
        //PERMITE EL INGRESO UNICAMENTE DE 2 DIGITOS
        if (jTextField7.getText().length()== 2){
            evt.consume();
        } 
        //Permitir solo el ingreso de NUMEROS
        char car = evt.getKeyChar();
        if(car<'0' || car>'9') evt.consume();
    }//GEN-LAST:event_jTextField7KeyTyped

    private void jTextField8KeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_jTextField8KeyTyped
        // TODO add your handling code here:
        //PERMITE EL INGRESO UNICAMENTE DE 1 DIGITOS
        if (jTextField8.getText().length()== 1){
            evt.consume();
        } 
        //Permitir solo el ingreso de NUMEROS
        char car = evt.getKeyChar();
        if(car<'0' || car>'9') evt.consume();
    }//GEN-LAST:event_jTextField8KeyTyped

    private void jMenuItem1ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jMenuItem1ActionPerformed
        // TODO add your handling code here:
        int fila= jTableBD.getSelectedRow();
        //ABRIR LA SEGUNDA PESTAÑA DEL jTabbedPane1
        jTabbedPane1.setSelectedIndex(1);
        if (fila>=0) {
            jTextField2.setText(jTableBD.getValueAt(fila, 0).toString());
            jTextField3.setText(jTableBD.getValueAt(fila, 1).toString());
            jTextField4.setText(jTableBD.getValueAt(fila, 2).toString());
            jTextField5.setText(jTableBD.getValueAt(fila, 3).toString());
            jTextField6.setText(jTableBD.getValueAt(fila, 4).toString());
            //----- INICIO PARA SELECCIONAR EN EL JCOMBOBOX2
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("APRENDIZ")==0){
                jComboBox2.setSelectedIndex(0);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("APRENDIZ (TALLER)")==0){
                jComboBox2.setSelectedIndex(1);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("AUXILIAR DE CUARTA")==0){
                jComboBox2.setSelectedIndex(2);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("AUXILIAR DE PRIMERA")==0){
                jComboBox2.setSelectedIndex(3);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("AUXILIAR DE SEGUNDA")==0){
                jComboBox2.setSelectedIndex(4);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("AUXILIAR DE TERCERA")==0){
                jComboBox2.setSelectedIndex(5);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("COND. C/CORTE CHOFER")==0){
                jComboBox2.setSelectedIndex(6);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("ENCARGADO DE TALLER")==0){
                jComboBox2.setSelectedIndex(7);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("ENCARGADO DE TRAFICO")==0){
                jComboBox2.setSelectedIndex(8);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("GOMERO")==0){
                jComboBox2.setSelectedIndex(9);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("GOMERO LAVADOR")==0){
                jComboBox2.setSelectedIndex(10);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("GUARDA")==0){
                jComboBox2.setSelectedIndex(11);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("INSPECTOR DE PRIMERA")==0){
                jComboBox2.setSelectedIndex(12);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("INSPECTOR DE SEGUNDA")==0){
                jComboBox2.setSelectedIndex(13);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("JEFE DE PERSONAL")==0){
                jComboBox2.setSelectedIndex(14);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("LAVADOR")==0){
                jComboBox2.setSelectedIndex(15);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("MAESTRANZA")==0){
                jComboBox2.setSelectedIndex(16);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("MANIOBRISTA")==0){
                jComboBox2.setSelectedIndex(17);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("MEDIO OFICIAL CHAPISTA")==0){
                jComboBox2.setSelectedIndex(18);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("MEDIO OFICIAL ELECTRICISTA")==0){
                jComboBox2.setSelectedIndex(19);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("MEDIO OFICIAL MECANICO")==0){
                jComboBox2.setSelectedIndex(20);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("OFICIAL CHAPISTA")==0){
                jComboBox2.setSelectedIndex(21);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("OFICIAL DE PRIMERA")==0){
                jComboBox2.setSelectedIndex(22);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("OFICIAL MECANICO")==0){
                jComboBox2.setSelectedIndex(23);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("PERSONAL DE MAESTRANZA")==0){
                jComboBox2.setSelectedIndex(24);
            }
            if (jTableBD.getValueAt(fila, 5).toString().compareTo("SERENO")==0){
                jComboBox2.setSelectedIndex(25);
            }
            //----- FIN PARA SELECCIONAR EN EL JCOMBOBOX2
            jTextField7.setText(jTableBD.getValueAt(fila, 6).toString().substring(0, 2));
            jTextField9.setText(jTableBD.getValueAt(fila, 2).toString());
            jTextField8.setText(jTableBD.getValueAt(fila, 6).toString().substring(10));
            jFormattedTextField1.setText(jTableBD.getValueAt(fila, 7).toString());
            if (jTableBD.getValueAt(fila, 8).toString().compareTo("S")==0){
                jComboBox3.setSelectedIndex(0);
            }
            if (jTableBD.getValueAt(fila, 8).toString().compareTo("N")==0){
                jComboBox3.setSelectedIndex(1);
            }
        }
        
        
    }//GEN-LAST:event_jMenuItem1ActionPerformed

    private void formMouseMoved(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_formMouseMoved
        // TODO add your handling code here:
        HabilitarBotones();
    }//GEN-LAST:event_formMouseMoved

    private void jTabbedPane1MouseMoved(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_jTabbedPane1MouseMoved
        // TODO add your handling code here:
        HabilitarBotones();
    }//GEN-LAST:event_jTabbedPane1MouseMoved

    private void jButton3ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton3ActionPerformed
        // TODO add your handling code here:
        //Conectar a la BD  y   actualiza todos sus datos
        Conectar cc= new Conectar();
        Connection cn= cc.conexion();
        //Grabar los nuevos Datos
           try {
            PreparedStatement pst = cn.prepareStatement("UPDATE empleados SET Leg='"+jTextField3.getText()+"',Dni='"+jTextField4.getText()+"',Apellido='"+jTextField5.getText()+"',Nombre='"+jTextField6.getText()+"',Categoria='"+(String) jComboBox2.getSelectedItem()+"',Cuil='"+jTextField7.getText()+jTextField4.getText()+jTextField8.getText()+"',FechaIngreso='"+jFormattedTextField1.getText()+"',Activo='"+(String) jComboBox3.getSelectedItem()+"' WHERE Cod='"+jTextField2.getText()+"'"); 
            pst.executeUpdate();
        } catch (SQLException ex) {
            Logger.getLogger(Consulta_de_Saldos.class.getName()).log(Level.SEVERE, null, ex);
        }
        //Vuelve a PADRON DE EMPLEADOS
        Padron_de_Empleados padron_de_empleados = new Padron_de_Empleados();
        padron_de_empleados.setVisible(true);
        this.setVisible(false);
    }//GEN-LAST:event_jButton3ActionPerformed

    private void jButton4ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton4ActionPerformed
        // TODO add your handling code here:
        //Conectar a la BD  
        Conectar cc= new Conectar();
        Connection cn= cc.conexion();
        String sql= "INSERT INTO empleados (Leg,Dni,Apellido,Nombre,Categoria,Cuil,FechaIngreso,Activo) VALUES (?,?,?,?,?,?,?,?)";
        try {
            PreparedStatement pst = cn.prepareStatement(sql);
            pst.setString(1, jTextField3.getText());
            pst.setString(2, jTextField4.getText());
            pst.setString(3, jTextField5.getText());
            pst.setString(4, jTextField6.getText());
            pst.setString(5, (String) jComboBox2.getSelectedItem());
            pst.setString(6, jTextField7.getText()+jTextField4.getText()+jTextField8.getText());
            pst.setString(7, jFormattedTextField1.getText());
            pst.setString(8, (String) jComboBox3.getSelectedItem());
            pst.executeUpdate();
        } catch (SQLException ex) {
            Logger.getLogger(Padron_de_Empleados.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        //Vuelve a PADRON DE EMPLEADOS
        Padron_de_Empleados padron_de_empleados = new Padron_de_Empleados();
        padron_de_empleados.setVisible(true);
        this.setVisible(false);
    }//GEN-LAST:event_jButton4ActionPerformed

    private void jTextField3ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jTextField3ActionPerformed
        // TODO add your handling code here:
    }//GEN-LAST:event_jTextField3ActionPerformed

    /**
     * @param args the command line arguments
     */
    public static void main(String args[]) {
        /* Set the Nimbus look and feel */
        //<editor-fold defaultstate="collapsed" desc=" Look and feel setting code (optional) ">
        /* If Nimbus (introduced in Java SE 6) is not available, stay with the default look and feel.
         * For details see http://download.oracle.com/javase/tutorial/uiswing/lookandfeel/plaf.html 
         */
        try {
            for (javax.swing.UIManager.LookAndFeelInfo info : javax.swing.UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    javax.swing.UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (ClassNotFoundException ex) {
            java.util.logging.Logger.getLogger(Padron_de_Empleados.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(Padron_de_Empleados.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(Padron_de_Empleados.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(Padron_de_Empleados.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        //</editor-fold>

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new Padron_de_Empleados().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JButton jButton1;
    private javax.swing.JButton jButton2;
    private javax.swing.JButton jButton3;
    private javax.swing.JButton jButton4;
    private javax.swing.JComboBox<String> jComboBox1;
    private javax.swing.JComboBox<String> jComboBox2;
    private javax.swing.JComboBox<String> jComboBox3;
    private javax.swing.JFormattedTextField jFormattedTextField1;
    private javax.swing.JLabel jLabel1;
    private javax.swing.JLabel jLabel10;
    private javax.swing.JLabel jLabel11;
    private javax.swing.JLabel jLabel12;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel3;
    private javax.swing.JLabel jLabel4;
    private javax.swing.JLabel jLabel5;
    private javax.swing.JLabel jLabel6;
    private javax.swing.JLabel jLabel7;
    private javax.swing.JLabel jLabel8;
    private javax.swing.JLabel jLabel9;
    private javax.swing.JMenuItem jMenuItem1;
    private javax.swing.JPanel jPanel1;
    private javax.swing.JPanel jPanel2;
    private javax.swing.JPopupMenu jPopupMenu1;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JTabbedPane jTabbedPane1;
    private javax.swing.JTable jTableBD;
    private javax.swing.JTextField jTextField1;
    private javax.swing.JTextField jTextField2;
    private javax.swing.JTextField jTextField3;
    private javax.swing.JTextField jTextField4;
    private javax.swing.JTextField jTextField5;
    private javax.swing.JTextField jTextField6;
    private javax.swing.JTextField jTextField7;
    private javax.swing.JTextField jTextField8;
    private javax.swing.JTextField jTextField9;
    // End of variables declaration//GEN-END:variables
}
